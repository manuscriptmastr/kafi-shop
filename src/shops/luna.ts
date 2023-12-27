import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Luna extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free CA/US shipping when you order 1kg or more.';
  static defaultSize = Size.TwoHundredFiftyGrams;
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
    const place = (await page.$('text/Place:'))!;
    return place.evaluate(
      (el) =>
        Array.from(el.childNodes)
          .map((e) => e.textContent!)
          .find((text) => /Place:\s/.test(text!))!
          .split(/Place:\s/)
          .at(-1)!,
    );
  }

  async getPrice(page: Page, size: Size) {
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
    const notes1 = await page.$('text/Tasting notes:');
    const notes2 = await page.$('text/Character:');
    const notes = (notes1 || notes2)!;
    return notes.evaluate((el) =>
      Array.from(el.childNodes)
        .map((e) => e.textContent!)
        .find((text) => /(Tasting notes|Character):\s/.test(text!))!
        .split(/(Tasting notes|Character):\s/)
        .at(-1)!
        .split(', '),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${Luna.url}/product-category/coffee`);
    return page.$$eval(
      'a.woocommerce-loop-product__link',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }
}
