import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class BlackAndWhite
  extends CoffeeShopBase
  implements CoffeeShopProperties
{
  static buyingTip = 'Free shipping on orders of $35 or more.';
  static name = 'Black & White Coffee';
  static sizes: Partial<Record<Size, string>> = {
    [Size.OneHundredGrams]: '100g',
    [Size.TwelveOunces]: '12oz',
    [Size.TwoPounds]: '2lb',
    [Size.FivePounds]: '5lb',
  };
  static url = 'https://www.blackwhiteroasters.com';

  async getOrigin(page: Page) {
    const singleOrigin = await page.$('strong::-p-text(Origin |)');
    const multipleOrigins = await page.$('strong::-p-text(Origins |)');
    const origin = singleOrigin || multipleOrigins;
    if (origin) {
      return origin.evaluate((el) => el.nextSibling!.textContent!.trim());
    } else {
      return 'N/A';
    }
  }

  async getName(page: Page) {
    return page.$eval('h1', (h1: HTMLHeadingElement) => h1.textContent!.trim());
  }

  async getPrice(page: Page, { size }: Metadata) {
    const option = await page.$(
      `span.opt-label__text::-p-text(${BlackAndWhite.sizes[size]})`,
    );
    if (!option) {
      throw new SkipError(`Size "${BlackAndWhite.sizes[size]}" does not exist`);
    }
    await option.click();
    const submitButton = (await page.$(
      'form .quantity-submit-row button[type="submit"]',
    ))!;
    if (
      await submitButton.evaluate((button) =>
        button.textContent!.trim().match(/sold out/i),
      )
    ) {
      throw new SkipError(`Size "${BlackAndWhite.sizes[size]}" is sold out`);
    }
    const price = await page.$eval(
      'div.ss-bottomless-variant-price',
      (div: HTMLDivElement) => div.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('meta[name="description"]', (meta: HTMLMetaElement) => [
      meta.content.trim(),
    ]);
  }

  async getUrls(page: Page) {
    let urls: string[] = [];

    const getAnchorsOnPage = () =>
      page.$$('.product-info a.product-link:not(:has(.price-label--sold-out))');
    const getUrlsOnPage = () =>
      page.$$eval(
        '.product-info a.product-link:not(:has(.price-label--sold-out))',
        (anchors: HTMLAnchorElement[]) =>
          anchors
            .filter(
              (a) =>
                !a.firstElementChild!.textContent!.trim().match(/gift card/i),
            )
            .map((a) => a.href),
      );

    let count = 0;

    while (true) {
      count++;
      await page.goto(
        `${BlackAndWhite.url}/collections/all-coffee?page=${count}`,
      );
      if (!(await getAnchorsOnPage()).length) {
        break;
      }
      urls = [...urls, ...(await getUrlsOnPage())];
    }

    return urls;
  }
}
