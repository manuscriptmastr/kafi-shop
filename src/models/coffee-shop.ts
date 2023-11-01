import puppeteer, { Page } from 'puppeteer';
import { mapAsync } from '../utils/async.js';
import { limit } from '../utils/semaphore.js';
import { Coffee } from './coffee.js';

export interface CoffeeShopLegacy {
  getProducts: () => Promise<Coffee[]>;
  getUrls: (page: Page) => Promise<string[]>;
}

export interface CoffeeShopProperties {
  getTastingNotes: (page: Page) => Promise<string>;
  getName: (page: Page) => Promise<string>;
  getCuppingScore: (page: Page) => Promise<Number | 'N/A'>;
  getPrice: (page: Page) => Promise<Number>;
  getProducts: () => Promise<Coffee[]>;
  getUrls: (page: Page) => Promise<string[]>;
  setupProductPage?: (page: Page) => Promise<void>;
  shouldSkipProductPage: (page: Page) => Promise<boolean>;
}

export enum CoffeeShopEnum {
  CoffeaCirculor = 'coffea-circulor',
  Manhattan = 'manhattan',
  Onyx = 'onyx',
  Passenger = 'passenger',
}

export class CoffeeShop {
  async getProducts() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // @ts-ignore
    const urls = await this.getUrls(page);
    await page.close();

    const unfilteredProducts: Coffee[] = await mapAsync(
      urls,
      limit(10, async (url: string): Promise<Coffee | null> => {
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

        const [name, flavors, price, score] = await Promise.all([
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
        return { name, flavors, price, score, url };
      }),
    );

    const products = unfilteredProducts
      .filter((p) => p)
      .sort((a, b) => a.price - b.price);
    await browser.close();
    return products;
  }
}
