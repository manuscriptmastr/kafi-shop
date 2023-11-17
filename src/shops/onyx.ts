import { CoffeeShop, CoffeeShopProperties } from '@models/coffee.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

const DOMAIN = 'https://onyxcoffeelab.com';

export class Onyx extends CoffeeShop implements CoffeeShopProperties {
  async getCuppingScore(page: Page) {
    return page.$eval(
      '[data-name="trans_cup_score"] p::-p-text(Cup Score)',
      (p) => Number(p.parentElement!.lastElementChild!.textContent!.trim()),
    );
  }

  async getName(page: Page) {
    return page.$eval('h1', (h1) => h1.firstChild!.textContent!);
  }

  async getPrice(page: Page) {
    const size = (await page.$('span.generic-option[data-value="10oz"]'))!;

    await size.click();

    const priceText = await page.$eval('div.price.variant-price', (div) =>
      div.textContent!.trim(),
    );

    return currency(priceText).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval(
      'div.image-features div.label::-p-text(Cup:) + div.value',
      (div) => div.textContent!.trim().split(/,\s/),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${DOMAIN}/collections/coffee`);

    return page.$$eval(
      'a.product-preview[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }

  async shouldSkipProductPage(page: Page) {
    return !(await page.$('span.generic-option[data-value="10oz"]'));
  }
}
