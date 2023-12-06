import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Luna extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free CA/US shipping when you order 1kg or more.';
  static name = 'Luna';
  static sizes: Partial<Record<Size, string>> = {
    [Size.TwoHundredFiftyGrams]: '250g',
    [Size.OneKilogram]: '1kg',
  };
  static url = 'https://enjoylunacoffee.com';

  async getName(page: Page) {
    return page.$eval('h1.product_title', (h1: HTMLHeadingElement) =>
      h1.textContent!.trim(),
    );
  }

  async getOrigin(page: Page) {
    return page.$eval('text/Place:', (el) => el.textContent!.trim());
  }

  async getPrice(page: Page, { size }: Metadata) {
    const option = await page.$(`.pdp label::-p-text(${Luna.sizes[size]})`);
    if (!option) {
      throw new SkipError(`Size "${Luna.sizes[size]}" does not exist`);
    }
    await option.click();
    const priceEl = (await page.$('p.price bdi'))!;
    if (
      await priceEl.evaluate((el) => el.textContent!.trim().match(/sold out/i))
    ) {
      throw new SkipError(`Size "${Luna.sizes[size]}" is sold out`);
    }
    const price = await priceEl.evaluate((el) =>
      el.lastChild!.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('text/Tasting notes:', (el) => [el.textContent!.trim()]);
  }

  async getUrls(page: Page) {
    await page.goto(`${Luna.url}/product-category/coffee`);
    return page.$$eval(
      'a.woocommerce-loop-product__link',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }
}
