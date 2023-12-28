import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError, wait } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Leuchtfeuer
  extends CoffeeShopBase
  implements CoffeeShopProperties
{
  static buyingTip = '';
  static defaultSize = Size.TwoHundredFiftyGrams;
  static name = 'Leuchtfeuer';
  static sizes: Partial<Record<Size, string>> = {
    [Size.OneHundredTwentyFiveGrams]: '125g',
    [Size.TwoHundredFiftyGrams]: '250g',
    [Size.FiveHundredGrams]: '500g',
    [Size.OneKilogram]: '1000g',
  };
  static url = 'https://www.leuchtfeuer.coffee';

  async getCuppingScore(page: Page) {
    const score = await page.$('th::-p-text(Cupping Score)');
    if (score) {
      return score.evaluate((th) =>
        Number(th.nextElementSibling!.textContent!.trim().replace(',', '.')),
      );
    } else {
      return 'N/A';
    }
  }

  async getName(page: Page) {
    return page.$eval('h1', (h1: HTMLHeadingElement) => h1.textContent!.trim());
  }

  async getOrigin(page: Page) {
    return page.$eval(
      '.product-information .product--text.style_vendor',
      (th) => th.textContent!.trim(),
    );
  }

  async getPrice(page: Page, size: Size) {
    const option = await page.$(
      `.product-information label:not(:is(.is-disabled + *)) span::-p-text(${size})`,
    );
    if (!option) {
      throw new SkipError(`Size "${Leuchtfeuer.sizes[size]}" does not exist`);
    }
    await option.click();
    await wait(250);
    const price = await page.$eval('.product-information span.amount', (span) =>
      span.textContent!.trim(),
    );
    return currency(price).value / 100;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('meta[name=description]', (meta: HTMLMetaElement) => [
      meta.content,
    ]);
  }

  async getUrls(page: Page) {
    await page.goto(
      `${Leuchtfeuer.url}/en-in/collections/alle-produkte-specialty-coffee`,
    );
    return page.$$eval(
      '.column product-card figure a',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .map((a) => a.href)
          .filter(
            (url) =>
              ![
                /cappuccino/i,
                /instant/i,
                /poster/i,
                /third-wave-water/i,
                /voucher/i,
              ].some((pattern) => pattern.test(url)),
          ),
    );
  }
}
