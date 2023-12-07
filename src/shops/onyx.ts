import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Onyx extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free shipping on orders of $40 or more.';
  static name = 'Onyx Coffee Lab';
  static sizes: Partial<Record<Size, string>> = {
    [Size.FourOunces]: '4oz',
    [Size.TenOunces]: '10oz',
    [Size.TwoPounds]: '2lbs',
    [Size.FivePounds]: '5lbs',
  };
  static url = 'https://onyxcoffeelab.com';

  async getCuppingScore(page: Page) {
    const cupScoreEl = await page.$(
      '[data-name="trans_cup_score"] p::-p-text(Cup Score)',
    );
    if (!cupScoreEl) {
      return 'N/A';
    } else {
      return cupScoreEl.evaluate((p) =>
        Number(p.parentElement!.lastElementChild!.textContent!.trim()),
      );
    }
  }

  async getName(page: Page) {
    const name = await page.$('h1');
    if (name) {
      return name.evaluate((h1) => h1.firstChild!.textContent!);
    } else {
      return 'N/A';
    }
  }

  async getPrice(page: Page, { size }: Metadata) {
    const option = await page.$(
      `span.generic-option[data-value="${Onyx.sizes[size]}"]`,
    );

    if (!option) {
      throw new SkipError(`Size "${Onyx.sizes[size]}" does not exist`);
    }

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
    await page.goto(`${Onyx.url}/collections/coffee`);

    return page.$$eval(
      'a.product-preview[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }
}
