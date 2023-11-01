import puppeteer, { Page } from 'puppeteer';
import { limit } from '../utils/semaphore.js';
import { mapAsync, wait } from '../utils/async.js';
import { Coffee } from '../models/coffee.js';
import { CoffeeShopEnum, CoffeeShop } from '../models/coffee-shop.js';

const DOMAIN = 'https://coffeacirculor.com';

export class CoffeaCirculor implements CoffeeShop {
  static id = CoffeeShopEnum.CoffeaCirculor;

  async getUrls(page: Page) {
    await page.goto(`${DOMAIN}/collections/all`);

    while (await page.$('#section-collection a.block-fade')) {
      const moreProductsButton = (await page.$(
        '#section-collection a.block-fade',
      ))!;
      await moreProductsButton.click();
      await wait(1000);
    }

    return page.$$eval(
      'a.product-item:not(:has(.sold))',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }

  async getCuppingScore(page: Page) {
    return Number(
      await page.$eval(
        'text/SCA SCORE',
        (el) => el.parentElement!.textContent!.split(/SCA SCORE\s/)[1],
      ),
    );
  }

  async getName(page: Page) {
    return page.$eval('h1.product-title', (el) => el.textContent!);
  }

  async getTastingNotes(page: Page) {
    return page.$eval(
      'text/Flavor',
      (el) => el.nextElementSibling!.textContent!,
    );
  }

  async shouldSkipProduct(page: Page) {
    const sizes = await page.$$('[data-text^="250g"] span');

    const prices = [];

    for (const size of sizes) {
      await size.click();
      const isAddToCartDisabled = await page.$eval(
        'button[name="add"]',
        (button) => button.disabled,
      );
      if (!isAddToCartDisabled) {
        const price = await page.$eval(
          'span.product-price',
          (el) => +el.textContent!.slice(1).replace(',', '') / 100,
        );

        prices.push(price);
      }
    }

    return !prices.length;
  }

  async getPrice(page: Page) {
    const sizes = await page.$$('[data-text^="250g"] span');

    const prices = [];

    for (const size of sizes) {
      await size.click();
      const isAddToCartDisabled = await page.$eval(
        'button[name="add"]',
        (button) => button.disabled,
      );
      if (!isAddToCartDisabled) {
        const price = await page.$eval(
          'span.product-price',
          (el) => +el.textContent!.slice(1).replace(',', '') / 100,
        );

        prices.push(price);
      }
    }

    return Math.min(...prices);
  }

  async getProducts() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const urls = await this.getUrls(page);

    const unfilteredProducts: Coffee[] = await mapAsync(
      urls,
      limit(10, async (url: string): Promise<Coffee | null> => {
        const page = await browser.newPage();
        await page.goto(url);

        if (await this.shouldSkipProduct(page)) {
          await page.close();
          return null;
        }

        const [name, flavors, price, score] = await Promise.all([
          this.getName(page),
          this.getTastingNotes(page),
          this.getPrice(page),
          this.getCuppingScore(page),
        ]);

        await page.close();

        return { name, flavors, price, score, url };
      }),
    );

    const products = unfilteredProducts
      .filter((p) => p)
      .sort((a, b) => a.price - b.price)
      .filter(({ price }) => price <= 20);
    await browser.close();
    return products;
  }
}
