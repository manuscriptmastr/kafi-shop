import currency from 'currency.js';
import puppeteer, { Page } from 'puppeteer';
import { CoffeeShopLegacy } from '../models/coffee-shop.js';
import { Coffee } from '../models/coffee.js';
import { mapAsync } from '../utils/async.js';
import { limit } from '../utils/semaphore.js';

const DOMAIN = 'https://onyxcoffeelab.com';

export class Onyx implements CoffeeShopLegacy {
  async getUrls(page: Page) {
    await page.goto(`${DOMAIN}/collections/coffee`);

    return page.$$eval(
      'a.product-preview[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
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

        const size = await page.$('span.generic-option[data-value="10oz"]');

        if (!size) {
          page.close();
          return null;
        }

        await size.click();

        const priceText = await page.$eval('div.price.variant-price', (div) =>
          div.textContent!.trim(),
        );

        const price = currency(priceText).value;

        const name = await page.$eval(
          'h1',
          (h1) => h1.firstChild!.textContent!,
        );

        const score = await page.$eval(
          '[data-name="trans_cup_score"] p::-p-text(Cup Score)',
          (p) => Number(p.parentElement!.lastElementChild!.textContent!.trim()),
        );

        const flavors = await page.$eval(
          'div.image-features div.label::-p-text(Cup:) + div.value',
          (div) => div.textContent!.trim(),
        );

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
