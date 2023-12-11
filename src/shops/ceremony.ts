import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import currency from 'currency.js';
import { ElementHandle, Page } from 'puppeteer';

export class Ceremony extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free shipping on orders of $40 or more.';
  static defaultSize = Size.TwelveOunces;
  static name = 'Ceremony Coffee Roasters';
  static sizes: Partial<Record<Size, string>> = {
    [Size.TwelveOunces]: '12oz',
    [Size.TwoPounds]: '2lb',
    [Size.FivePounds]: '5lb',
  };
  static url = 'https://shop.ceremonycoffee.com';

  async getName(page: Page) {
    return page.$eval('#pdp-order h1', (h1: HTMLHeadingElement) =>
      h1.textContent!.trim(),
    );
  }

  async getPrice(page: Page, size: Size) {
    const select = (await page.$(
      '#pdp-order #SingleOptionSelector-0',
    )) as ElementHandle<HTMLSelectElement>;
    await select.select(Ceremony.sizes[size]!);
    const price = await page.$eval(
      '#pdp-order span[data-product-price]',
      (span: HTMLSpanElement) => span.textContent!.trim(),
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval(
      '#pdp-order [data-price-wrapper] + p',
      (p: HTMLParagraphElement) => p.textContent!.trim().split(', '),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${Ceremony.url}/collections/coffee`);
    return page.$$eval(
      '#pcp-coffee a[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .filter(
            (a) =>
              ![/instant/i, /set/i, /subscription/i].some((str) =>
                a
                  .previousElementSibling!.querySelector('p')!
                  .textContent!.trim()
                  .match(str),
              ),
          )
          .map((a) => a.href),
    );
  }
}
