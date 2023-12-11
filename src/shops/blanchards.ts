import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Blanchards extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip = 'Free shipping on orders of $60 or more.';
  static defaultSize = Size.TwelveOunces;
  static name = "Blanchard's Coffee";
  static sizes: Partial<Record<Size, string>> = {
    [Size.TwelveOunces]: '12 oz',
    [Size.TwoAndAHalfPounds]: '2.5 lb',
    [Size.FivePounds]: '5 lb',
  };
  static url = 'https://blanchardscoffee.com';

  async getName(page: Page) {
    return page.$eval(
      'h1.product-area__details__title',
      (h1: HTMLHeadingElement) => h1.textContent!.trim(),
    );
  }

  async getOrigin(page: Page) {
    const anchor = await page.$('span.brand a');
    if (anchor) {
      return page.$eval('span.brand a', (a: HTMLAnchorElement) =>
        a.textContent!.trim(),
      );
    } else {
      return 'N/A';
    }
  }

  async getPrice(page: Page, { size }: Metadata) {
    const option1 = await page.$(`a[data-value="${Blanchards.sizes[size]}"]`);
    const option2 = await page.$(`a[data-value="${size}"]`);
    const button = (option1 || option2)!;
    await button.click();
    const price = await page.$eval(
      'span[data-smartrr-subscribe-price]',
      (span: HTMLSpanElement) => {
        return span.textContent!.trim();
      },
    );
    return currency(price).value;
  }

  async getTastingNotes(page: Page) {
    return page.$$eval(
      'summary::-p-text(Tasting Notes) + div.cc-accordion-item__panel p',
      (paragraphs: HTMLParagraphElement[]) =>
        paragraphs.map((p) => p.textContent!.trim()),
    );
  }

  async getUrls(page: Page): Promise<string[]> {
    await page.goto(`${Blanchards.url}/collections/coffee-1`);
    // @ts-ignore
    return page.$$eval('a:has(> span.title)', (anchors: HTMLAnchorElement[]) =>
      anchors
        .filter(
          (a) =>
            ![/instant/i, /set/i, /subscription/i].some((str) =>
              a.firstElementChild!.textContent!.trim().match(str),
            ),
        )
        .map((a) => a.href),
    );
  }
}
