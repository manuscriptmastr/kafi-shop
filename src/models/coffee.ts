import { limit, mapAsync } from '@utils';
import puppeteer, { Page } from 'puppeteer';
import { Cache } from '../cache.js';

export interface Coffee {
  country: string | 'N/A';
  cuppingScore: number | 'N/A';
  name: string;
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
  getCountry?: (page: Page, metadata: Metadata) => Promise<string>;
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

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // @ts-ignore
    const urls = await this.getUrls(page, metadata);
    await page.close();

    const unfilteredProducts: Coffee[] = await mapAsync(
      urls,
      limit(10, async (url: string): Promise<Coffee | null> => {
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForNetworkIdle();

        if (
          'shouldSkipProductPage' in this &&
          // @ts-ignore
          (await this.shouldSkipProductPage(page, metadata))
        ) {
          page.close();
          return null;
        }

        if ('setupProductPage' in this) {
          // @ts-ignore
          await this.setupProductPage(page, metadata);
        }

        const [name, country, tastingNotes, price, cuppingScore] =
          await Promise.all([
            // @ts-ignore
            this.getName(page, metadata),
            'getCountry' in this
              ? // @ts-ignore
                this.getCountry(page, metadata)
              : ('N/A' as const),
            // @ts-ignore
            this.getTastingNotes(page, metadata),
            // @ts-ignore
            this.getPrice(page, metadata),
            'getCuppingScore' in this
              ? // @ts-ignore
                this.getCuppingScore(page, metadata)
              : ('N/A' as const),
          ]);

        await page.close();
        return { name, country, tastingNotes, price, cuppingScore, url };
      }),
    );

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
