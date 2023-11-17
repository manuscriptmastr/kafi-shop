import { mapAsync } from '@utils/async.js';
import { limit } from '@utils/semaphore.js';
import puppeteer, { Page } from 'puppeteer';

export interface Coffee {
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

export interface CoffeeShopProperties {
  getTastingNotes: (page: Page) => Promise<string[]>;
  getName: (page: Page) => Promise<string>;
  getCuppingScore: (page: Page) => Promise<Number | 'N/A'>;
  getPrice: (page: Page) => Promise<Number>;
  getProducts: () => Promise<(Coffee | CoffeeError)[]>;
  getUrls: (page: Page) => Promise<string[]>;
  setupProductPage?: (page: Page) => Promise<void>;
  shouldSkipProductPage: (page: Page) => Promise<boolean>;
}

export enum CoffeeShopEnum {
  CoffeaCirculor = 'coffea-circulor',
  Manhattan = 'manhattan',
  Onyx = 'onyx',
  Passenger = 'passenger',
  Sey = 'sey',
}

export const getCoffeeShopName = (shop: CoffeeShopEnum) => {
  const coffeeShopNames: { [key in CoffeeShopEnum]: string } = {
    [CoffeeShopEnum.CoffeaCirculor]: 'Coffea Circulor',
    [CoffeeShopEnum.Manhattan]: 'Manhattan Coffee Roasters',
    [CoffeeShopEnum.Onyx]: 'Onyx Coffee Lab',
    [CoffeeShopEnum.Passenger]: 'Passenger Coffee',
    [CoffeeShopEnum.Sey]: 'Sey',
  };

  return coffeeShopNames[shop];
};

export class CoffeeShop {
  async getProducts() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // @ts-ignore
    const urls = await this.getUrls(page);
    await page.close();

    const unfilteredProducts: Coffee[] = await mapAsync(
      urls,
      limit(10, async (url: string): Promise<Coffee | CoffeeError | null> => {
        try {
          const page = await browser.newPage();
          await page.goto(url);

          // @ts-ignore
          if (await this.shouldSkipProductPage(page)) {
            page.close();
            return null;
          }

          if (this.hasOwnProperty('setupProductPage')) {
            // @ts-ignore
            await this.setupProductPage(page);
          }

          const [name, tastingNotes, price, cuppingScore] = await Promise.all([
            // @ts-ignore
            this.getName(page),
            // @ts-ignore
            this.getTastingNotes(page),
            // @ts-ignore
            this.getPrice(page),
            // @ts-ignore
            this.getCuppingScore(page),
          ]);

          await page.close();
          return { name, tastingNotes, price, cuppingScore, url };
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
