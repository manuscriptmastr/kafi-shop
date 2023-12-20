import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class LaCabra extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free international shipping on orders over ~$80.';
  static defaultSize = Size.TwoHundredFiftyGrams;
  static name = 'La Cabra';
  static sizes: Partial<Record<Size, string>> = {
    [Size.OneHundredGrams]: '100g (3.5oz)',
    [Size.TwoHundredFiftyGrams]: '250g (8.8oz)',
    [Size.OneKilogram]: '1000g (35.2oz)',
  };
  static url = 'https://www.lacabra.dk';

  async getName(page: Page) {
    return page.$eval('.lc-product-title', (el) => el.textContent!.trim());
  }

  async getOrigin(page: Page) {
    return page.$eval('.lc-product-country', (el) => el.textContent!.trim());
  }

  async getPrice(page: Page, size: Size) {
    const option = await page.$(
      `#SingleOptionSelector-0 option[value="${LaCabra.sizes[size]}"]`,
    );
    if (!option) {
      throw new SkipError(`Size "${LaCabra.sizes[size]}" does not exist`);
    }
    const select = (await page.$('#SingleOptionSelector-0'))!;
    await select.select(LaCabra.sizes[size]!);
    const price = await page.$eval(
      'span[data-regular-price]',
      (span: HTMLSpanElement) => span.firstChild!.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('.lc-product-taste', (el) =>
      el.textContent!.trim().split(', '),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${LaCabra.url}/collections/coffee`);
    return page.$$eval(
      '#Collection > ul.row a.grid-view-item__link',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }
}
