import { limit, mapAsync } from '@utils';
import puppeteer, { Page } from 'puppeteer';
import { Cache } from '../cache.js';

export interface Coffee {
  cuppingScore: number | 'N/A';
  name: string;
  origin: string | 'N/A';
  price: number;
  tastingNotes: string[];
  url: string;
}

export interface CoffeeWithNewFlag extends Coffee {
  new: boolean;
}

export interface Metadata {
  size: Size;
}

export interface CoffeeShopProperties {
  getTastingNotes: (page: Page, metadata: Metadata) => Promise<string[]>;
  getName: (page: Page, metadata: Metadata) => Promise<string>;
  getOrigin?: (page: Page, metadata: Metadata) => Promise<string>;
  getCuppingScore?: (page: Page, metadata: Metadata) => Promise<number>;
  getPrice: (page: Page, metadata: Metadata) => Promise<number>;
  getProducts: (metadata: Metadata) => Promise<CoffeeWithNewFlag[]>;
  getUrls: (page: Page, metadata: Metadata) => Promise<string[]>;
  setupProductPage?: (page: Page, metadata: Metadata) => Promise<void>;
  shouldSkipProductPage?: (page: Page, metadata: Metadata) => Promise<boolean>;
}

export enum Size {
  FortyGrams = '40g',
  OneHundredGrams = '100g',
  OneHundredTwentyFiveGrams = '125g',
  TwoHundredFiftyGrams = '250g',
  FiveHundredGrams = '500g',
  OneKilogram = '1kg',
  FourOunces = '4oz',
  FiveOunces = '5oz',
  EightOunces = '8oz',
  TenOunces = '10oz',
  TwelveOunces = '12oz',
  TwoPounds = '2lb',
  TwoAndAHalfPounds = '2.5lb',
  FivePounds = '5lb',
}

export class CoffeeShopBase {
  async getProducts(
    this: CoffeeShopBase & CoffeeShopProperties,
    { size }: Metadata,
  ) {
    const metadata = { size };

    /**
     * - The 'new' headless mode is currently flaky when batch scraping pages.
     * Using the old headless mode (designated by `true`) causes a warning to show
     * but works consistently with parallel scraping.
     * - The `--enable-resource-load-scheduler=false` flag lets pages load in parallel.
     */
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--enable-resource-load-scheduler=false'],
    });
    const page = await browser.newPage();

    // @ts-ignore
    const urls = await this.getUrls(page, metadata);
    await page.close();

    const getProductFromPage = limit(
      10,
      async (url: string): Promise<Coffee | null> => {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        if (
          'shouldSkipProductPage' in this &&
          // @ts-ignore
          (await this.shouldSkipProductPage(page, metadata))
        ) {
          await context.close();
          return null;
        }

        if ('setupProductPage' in this) {
          // @ts-ignore
          await this.setupProductPage(page, metadata);
        }

        const pageResults = await Promise.allSettled([
          'getCuppingScore' in this
            ? // @ts-ignore
              this.getCuppingScore(page, metadata)
            : ('N/A' as const),
          // @ts-ignore
          this.getName(page, metadata),
          'getOrigin' in this
            ? // @ts-ignore
              this.getOrigin(page, metadata)
            : ('N/A' as const),
          // @ts-ignore
          this.getPrice(page, metadata),
          // @ts-ignore
          this.getTastingNotes(page, metadata),
        ]);

        if (pageResults.some(({ status }) => status === 'rejected')) {
          await context.close();
          return null;
        }

        const [cuppingScore, name, origin, price, tastingNotes] =
          // @ts-ignore
          pageResults.map((r) => r.value);

        await context.close();
        return {
          cuppingScore,
          name,
          origin,
          price,
          tastingNotes,
          url,
        };
      },
    );

    const unfilteredProducts = await mapAsync(urls, getProductFromPage);
    await browser.close();

    const products = unfilteredProducts
      .filter((p) => p)
      .sort((a, b) => a.price - b.price);

    const cache = new Cache();
    const lastCache = (await cache.get<Coffee[]>(this.constructor.name)) ?? [];

    const productsWithNewFlag = products.map((product) => ({
      ...product,
      new: !lastCache.some(({ url }) => product.url === url),
    }));

    await cache.set(this.constructor.name, products);

    return productsWithNewFlag;
  }
}
