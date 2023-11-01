import { Page } from 'puppeteer';
import { CoffeeShop, CoffeeShopProperties } from '../models/coffee.js';
import { wait } from '../utils/async.js';

const DOMAIN = 'https://coffeacirculor.com';

export class CoffeaCirculor extends CoffeeShop implements CoffeeShopProperties {
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

  async shouldSkipProductPage(page: Page) {
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
}
