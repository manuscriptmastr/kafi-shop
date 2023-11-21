import {
  CoffeeShop,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Onyx extends CoffeeShop implements CoffeeShopProperties {
  url = 'https://onyxcoffeelab.com';
  name = 'Onyx Coffee Lab';
  buyingTip = 'Free shipping on orders of $40 or more.';
  sizes: Partial<Record<Size, string>> = {
    [Size.FourOunces]: '4oz',
    [Size.TenOunces]: '10oz',
    [Size.TwoPounds]: '2lbs',
    [Size.FivePounds]: '5lbs',
  };

  async getCuppingScore(page: Page) {
    return page.$eval(
      '[data-name="trans_cup_score"] p::-p-text(Cup Score)',
      (p) => Number(p.parentElement!.lastElementChild!.textContent!.trim()),
    );
  }

  async getName(page: Page) {
    return page.$eval('h1', (h1) => h1.firstChild!.textContent!);
  }

  async getPrice(page: Page, { size }: Metadata) {
    const option = (await page.$(
      `span.generic-option[data-value="${this.sizes[size]}"]`,
    ))!;

    await option.click();

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
    await page.goto(`${this.url}/collections/coffee`);

    return page.$$eval(
      'a.product-preview[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }

  async shouldSkipProductPage(page: Page, { size }: Metadata) {
    return !(await page.$(
      `span.generic-option[data-value="${this.sizes[size]}"]`,
    ));
  }
}
