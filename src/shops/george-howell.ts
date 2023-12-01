import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { autoScroll, clickOnElementManually } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class GeorgeHowell
  extends CoffeeShopBase
  implements CoffeeShopProperties
{
  static buyingTip = 'Free shipping on orders of $50 or more.';
  static name = 'George Howell Coffee';
  static sizes: Partial<Record<Size, string>> = {
    [Size.EightOunces]: '8 oz',
    [Size.TwelveOunces]: '12 oz',
    [Size.TwoPounds]: '2 lb',
    [Size.FivePounds]: '5 lb',
  };
  static url = 'https://georgehowellcoffee.com';

  async getOrigin(page: Page) {
    const origin = await page.$('text/COUNTRY');
    if (origin) {
      return origin.evaluate((el) =>
        el.nextElementSibling!.textContent!.trim(),
      );
    } else {
      return 'N/A';
    }
  }

  async getName(page: Page) {
    return page.$eval('h1', (h1: HTMLHeadingElement) => h1.textContent!.trim());
  }

  async getPrice(page: Page, { size }: Metadata) {
    await page.click('#SingleOptionSelector-0');
    const option1 = await page.$(
      `#SingleOptionSelector-0-dropdown li[value="${GeorgeHowell.sizes[size]}"]`,
    );
    const option2 = await page.$(
      `#SingleOptionSelector-0-dropdown li[value="${size}"]`,
    );
    const li = (option1 || option2)!;
    await clickOnElementManually(page, li);
    const price = await page.$eval(
      '#ProductPrice span.money',
      (span: HTMLSpanElement) => span.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('.product-details-subtext', (el) =>
      el.textContent!.trim().split(', '),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${GeorgeHowell.url}/collections/all-coffee`);
    await autoScroll(page);
    return page.$$eval(
      '#CollectionProductGrid .product-grid--title.text-left > a',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .filter(
            (a) =>
              ![/instant/i, /set/i, /subscription/i].some((str) =>
                a.textContent!.trim().match(str),
              ),
          )
          .map((a) => a.href),
    );
  }

  async shouldSkipProductPage(page: Page, { size }: Metadata) {
    const option1 = await page.$(
      `#SingleOptionSelector-0-dropdown li[value="${GeorgeHowell.sizes[size]}"]`,
    );
    const option2 = await page.$(
      `#SingleOptionSelector-0-dropdown li[value="${size}"]`,
    );
    return !(option1 || option2);
  }
}
