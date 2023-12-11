import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Ilse extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free shipping on orders over $50.';
  static defaultSize = Size.TwelveOunces;
  static name = 'Ilse Coffee';
  static sizes: Partial<Record<Size, string>> = {
    [Size.OneHundredTwentyFiveGrams]: '125g',
    [Size.TwoHundredFiftyGrams]: '250g',
    [Size.TwelveOunces]: '12oz',
    [Size.TwoPounds]: '2lb',
    [Size.FivePounds]: '5lb',
  };
  static url = 'https://ilsecoffee.com';

  async getName(page: Page) {
    return page.$eval('h1', (h1: HTMLHeadingElement) => h1.textContent!.trim());
  }

  async getOrigin(page: Page) {
    const title = await this.getName(page);
    const [origin, name] = title.split(' | ');
    if (!name) {
      return 'N/A';
    } else {
      return origin;
    }
  }

  async getPrice(page: Page, size: Size) {
    const select = (await page.$('select#SingleOptionSelector-0'))!;
    const options = await page.$$eval(
      'select#SingleOptionSelector-0 option',
      (options: HTMLOptionElement[]) => options.map((o) => o.value),
    );
    if (!options.includes(size)) {
      throw new SkipError(`Size "${Ilse.sizes[size]}" does not exist.`);
    }
    await select.select(Ilse.sizes[size]!);
    const price = await page.$eval(
      'span[data-regular-price]',
      (span: HTMLSpanElement) => span.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('text/We taste', (el) =>
      el
        .nextElementSibling!.lastChild!.textContent!.trim()
        .split(/:\s/i)
        .at(-1)!
        .split(', '),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${Ilse.url}/collections/beans`);
    return page.$$eval(
      '#Collection a[href^="/collections/beans/products/"]',
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }
}
