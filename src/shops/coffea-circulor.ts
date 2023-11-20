import {
  CoffeeShop,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { wait } from '@utils/async.js';
import { Page } from 'puppeteer';

export class CoffeaCirculor extends CoffeeShop implements CoffeeShopProperties {
  url = 'https://coffeacirculor.com';
  name = 'Coffea Circulor';
  buyingTip = 'Free international shipping (and sample) when you buy 1kg.';
  sizes = [
    Size.FortyGrams,
    Size.OneHundredGrams,
    Size.TwoHundredFiftyGrams,
    Size.OneKilogram,
  ];

  async getCountry(page: Page) {
    return page.$eval('text/Country', (el) =>
      el.nextElementSibling!.textContent!.trim(),
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

  async getPrice(page: Page, { size }: Metadata) {
    const sizes = await page.$$(`[data-text^="${size}"] span`);

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

  async getTastingNotes(page: Page) {
    return page.$eval('text/Flavor', (el) =>
      el.nextElementSibling!.textContent!.trim().split(/,\s/),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${this.url}/collections/all`);

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

  async shouldSkipProductPage(page: Page, { size }: Metadata) {
    const sizes = await page.$$(`[data-text^="${size}"] span`);

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
}
