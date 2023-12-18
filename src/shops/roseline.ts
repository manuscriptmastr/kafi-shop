import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Roseline extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free shipping on orders over $50.';
  static defaultSize = Size.TwelveOunces;
  static name = 'Roseline Coffee';
  static sizes: Partial<Record<Size, string>> = {
    [Size.TwelveOunces]: '12oz',
    [Size.TwoPounds]: '2lb',
    [Size.FivePounds]: '5lb',
  };
  static url = 'https://roselinecoffee.com';

  async getName(page: Page) {
    return page.$eval('h1', (h1: HTMLHeadingElement) => h1.textContent!.trim());
  }

  async getOrigin(page: Page) {
    return page.$eval('p.h5::-p-text(Origin)', (p: HTMLParagraphElement) =>
      p.nextElementSibling!.textContent!.trim(),
    );
  }

  async getPrice(page: Page, size: Size) {
    const option = await page.$(
      `label.block-swatch span::-p-text(${Roseline.sizes[size]})`,
    );
    if (!option) {
      throw new SkipError(`Size "${Roseline.sizes[size]}" does not exist`);
    }
    await option.click();
    const price = await page.$eval(
      '.product-info sale-price span::-p-text(Sale price)',
      (el) => el.nextSibling!.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('p.h5::-p-text(Tasting Notes)', (el) => [
      el
        .nextElementSibling!.querySelector('.metafield-rich_text_field')!
        .textContent!.trim(),
    ]);
  }

  async getUrls(page: Page) {
    await page.goto(`${Roseline.url}/collections/coffees`);
    return page.$$eval(
      '.product-card .product-card__figure > a',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .map((a) => a.href)
          .filter((url) => ![/sampler/i].some((pattern) => pattern.test(url))),
    );
  }
}
