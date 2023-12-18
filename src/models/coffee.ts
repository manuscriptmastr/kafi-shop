import { SkipError, limit, mapAsync } from '@utils';
import puppeteer, { Page } from 'puppeteer';

export interface Coffee {
  cuppingScore: number | 'N/A';
  name: string;
  origin: string | 'N/A';
  prices: Partial<Record<Size, number>>;
  tastingNotes: string[];
  url: string;
}

export interface CoffeeShopProperties {
  getCuppingScore?: (page: Page) => Promise<number | 'N/A'>;
  getName: (page: Page) => Promise<string>;
  getOrigin?: (page: Page) => Promise<string>;
  getPrice: (page: Page, size: Size) => Promise<number>;
  getProducts: () => Promise<Coffee[]>;
  getTastingNotes: (page: Page) => Promise<string[]>;
  getUrls: (page: Page) => Promise<string[]>;
  setupProductPage?: (page: Page) => Promise<void>;
}

export enum Size {
  None = 'none',
  FortyGrams = '40g',
  OneHundredGrams = '100g',
  OneHundredTwentyFiveGrams = '125g',
  TwoHundredGrams = '200g',
  TwoHundredFiftyGrams = '250g',
  ThreeHundredGrams = '300g',
  FiveHundredGrams = '500g',
  OneKilogram = '1kg',
  FourOunces = '4oz',
  FiveOunces = '5oz',
  EightOunces = '8oz',
  TenOunces = '10oz',
  TwelveOunces = '12oz',
  OnePound = '1lb',
  TwoPounds = '2lb',
  TwoAndAHalfPounds = '2.5lb',
  FivePounds = '5lb',
}

export class CoffeeShopBase {
  async getProducts(this: CoffeeShopBase & CoffeeShopProperties) {
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
    const urls = await this.getUrls(page);
    await page.close();

    const getProductFromPage = limit(
      10,
      async (url: string): Promise<Coffee | null> => {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        try {
          if ('setupProductPage' in this) {
            // @ts-ignore
            await this.setupProductPage(page);
          }

          const prices: Partial<Record<Size, number>> = {};
          // @ts-ignore
          for (const _size in this.constructor.sizes) {
            try {
              const size = _size as Size;
              const price = await this.getPrice(page, size);
              prices[size] = price;
            } catch (e) {
              if (!(e instanceof SkipError)) {
                throw e;
              }
            }
          }

          if (Object.keys(prices).length === 0) {
            throw new SkipError('Sold out');
          }

          const cuppingScore =
            'getCuppingScore' in this
              ? // @ts-ignore
                await this.getCuppingScore(page)
              : ('N/A' as const);
          const name = await this.getName(page);
          const origin =
            'getOrigin' in this
              ? // @ts-ignore
                await this.getOrigin(page)
              : ('N/A' as const);
          const tastingNotes = await this.getTastingNotes(page);

          return {
            cuppingScore,
            name,
            origin,
            prices,
            tastingNotes,
            url,
          };
        } catch (e) {
          if (e instanceof SkipError) {
            console.log(`Skipping ${url}: ${e.message}`);
            return null;
          } else {
            console.log(url);
            throw e;
          }
        } finally {
          await context.close();
        }
      },
    );

    const unfilteredProducts: Coffee[] = await mapAsync(
      urls,
      getProductFromPage,
    );
    await browser.close();

    const products = unfilteredProducts
      .filter((p) => p)
      .sort(
        (a, b) =>
          // @ts-ignore
          a.prices[this.constructor.defaultSize] -
          // @ts-ignore
          b.prices[this.constructor.defaultSize],
      );

    return products;
  }
}
