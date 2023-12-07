import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Monogram extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip =
    'Free CA shipping over $50, and free US shipping over $70.';
  static name = 'Monogram Coffee';
  static sizes: Partial<Record<Size, string>> = {
    [Size.TwoHundredGrams]: '200g',
    [Size.ThreeHundredGrams]: '300g',
    [Size.TwoPounds]: '2LB',
    [Size.FivePounds]: '5LB',
  };
  static url = 'https://monogramcoffee.com';

  async getName(page: Page) {
    return page.$eval('h1.product__title', (h1: HTMLHeadingElement) =>
      h1.textContent!.trim(),
    );
  }

  async getOrigin(page: Page) {
    return page.$eval('text/ORIGIN: ', (el) =>
      el.firstChild!.textContent!.trim().split('ORIGIN: ').at(-1)!.trim(),
    );
  }

  async getPrice(page: Page, { size }: Metadata) {
    const option1 = await page.$(
      `button[data-option-value="${Monogram.sizes[size]}"]`,
    );
    const option2 = await page.$(`button[data-option-value="${size}"]`);
    const option = option1 || option2;
    if (!option) {
      throw new SkipError(`Size ${Monogram.sizes[size]}} does not exist.`);
    }
    await option.click();
    const price = await page.$eval('[data-price]', (el) =>
      el.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('text/Tastes like:', (el) =>
      Array.from(
        el.parentElement!.parentElement!.parentElement!.nextElementSibling!.querySelectorAll(
          '.product__callouts-mini-item-text',
        ),
      ).map((el) => el.textContent!.trim()),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${Monogram.url}/en-us/collections/whole-bean-coffee`);
    return (await page.$$eval(
      'a.product-item__image-link:not(:has(+ div .product-badge--sold-out))',
      // @ts-ignore
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    )) as string[];
  }
}
