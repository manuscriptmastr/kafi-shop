import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Color extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free US shipping on orders over $50.';
  static defaultSize = Size.TenOunces;
  static name = 'Color Coffee Roasters';
  static sizes: Partial<Record<Size, string>> = {
    [Size.TenOunces]: '10 OZ',
    [Size.OnePound]: '1 LBS',
    [Size.FivePounds]: '5 LBS',
  };
  static url = 'https://colorroasters.com';

  async getName(page: Page) {
    return page.$eval('h1.section__title-text', (h1: HTMLHeadingElement) =>
      h1.textContent!.trim(),
    );
  }

  async getOrigin(page: Page) {
    return page.$eval(
      '.product-single__content-text h1 span',
      (span: HTMLSpanElement) => span.textContent!.trim(),
    );
  }

  async getPrice(page: Page, size: Size) {
    const option = await page.$(
      `.product-single__box form select option[value^="${Color.sizes[size]}"]`,
    );
    if (!option) {
      throw new SkipError(`Size "${Color.sizes[size]}" does not exist`);
    }
    const optionText = await option.evaluate((option) =>
      option.textContent!.trim(),
    );
    const select = (await page.$(
      `.product-single__box form select:has(option[value="${optionText}"])`,
    ))!;
    await select.select(optionText);
    const price = await page.$eval(
      '.product-single__box form .product-single__box__block--price .product-single__price-number span.money',
      (span: HTMLSpanElement) => span.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    const text = await page.$eval(
      '.product-single__content-text h1 + p + p span:not(:has(span), :empty)',
      (span) => span.textContent!.trim(),
    );
    return text.split(/\s\|\s/i)[0].split(', ');
  }

  async getUrls(page: Page) {
    await page.goto(`${Color.url}/collections/all-coffee`);
    return page.$$eval(
      '.product-card__details a[href^="/collections/all-coffee/products"]',
      (anchors: HTMLAnchorElement[]) =>
        [...new Set(anchors.map((a) => a.href))].filter(
          (href) =>
            ![/pack/i, /sample/i, /variety/i].some((pattern) =>
              pattern.test(href),
            ),
        ),
    );
  }
}
