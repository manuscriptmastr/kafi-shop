import { mapAsync } from '@utils/async.js';
import { limit } from '@utils/semaphore.js';
import puppeteer, { Page } from 'puppeteer';

export interface Coffee {
  country: string | 'N/A';
  cuppingScore: number | 'N/A';
  name: string;
  price: number;
  tastingNotes: string[];
  url: string;
}

export interface CoffeeError {
  error: string;
  price: 0;
  url: string;
}

export interface Metadata {
  size: Size;
}

/**
 * @todo Rephrase sizes as Partial<Record<Size, string>>, then tighten types per coffee shop
 * @todo Use static properties for url, name, buyingTip, and sizes
 */
export interface CoffeeShopProperties {
  url: string;
  name: string;
  buyingTip: string;
  sizes: Size[];
  getTastingNotes: (page: Page, metadata: Metadata) => Promise<string[]>;
  getName: (page: Page, metadata: Metadata) => Promise<string>;
  getCountry?: (page: Page, metadata: Metadata) => Promise<string>;
  getCuppingScore?: (page: Page, metadata: Metadata) => Promise<number>;
  getPrice: (page: Page, metadata: Metadata) => Promise<number>;
  getProducts: (metadata: Metadata) => Promise<(Coffee | CoffeeError)[]>;
  getUrls: (page: Page, metadata: Metadata) => Promise<string[]>;
  setupProductPage?: (page: Page, metadata: Metadata) => Promise<void>;
  shouldSkipProductPage: (page: Page, metadata: Metadata) => Promise<boolean>;
}

export enum CoffeeShopEnum {
  CoffeaCirculor = 'coffea-circulor',
  Manhattan = 'manhattan',
  Onyx = 'onyx',
  Passenger = 'passenger',
  Sey = 'sey',
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
  TwoPounds = '2lb',
  FivePounds = '5lb',
}

export class CoffeeShop {
  async getProducts(this: CoffeeShopProperties, { size }: { size: Size }) {
    if (!this.sizes.includes(size)) {
      throw new Error(
        `Coffee shop "${
          this.name
        }" does not have size "${size}". Try: ${this.sizes
          .map((size) => `"${size}"`)
          .join(', ')}.`,
      );
    }

    const metadata = { size };

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // @ts-ignore
    const urls = await this.getUrls(page, metadata);
    await page.close();

    const unfilteredProducts: Coffee[] = await mapAsync(
      urls,
      limit(10, async (url: string): Promise<Coffee | CoffeeError | null> => {
        try {
          const page = await browser.newPage();
          await page.goto(url);

          // @ts-ignore
          if (await this.shouldSkipProductPage(page, metadata)) {
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
        } catch (e) {
          await page.close();
          return { error: e!.toString(), price: 0, url };
        }
      }),
    );

    const products = unfilteredProducts
      .filter((p) => p)
      .sort((a, b) => a.price - b.price);
    await browser.close();
    return products;
  }
}
