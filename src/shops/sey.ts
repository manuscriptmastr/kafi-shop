import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Sey extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip =
    'Try out the monthly subscription for some pretty great savings + free shipping.';
  static defaultSize = Size.TwoHundredFiftyGrams;
  static name = 'Sey';
  static sizes: Partial<Record<Size, string>> = {
    [Size.TwoHundredFiftyGrams]: '250g',
    [Size.TwoPounds]: '2lb',
    [Size.FivePounds]: '5lb',
  };
  static url = 'https://www.seycoffee.com';

  async getName(page: Page) {
    return page.$eval(
      'span.coffeeTitle_producer',
      (span: HTMLSpanElement) => span.textContent!,
    );
  }

  async getOrigin(page: Page) {
    return page.$eval('span.coffeeTitle_country', (span: HTMLSpanElement) =>
      span.textContent!.trim(),
    );
  }

  async getPrice(page: Page, size: Size) {
    if (
      !(await page.$('select')) ||
      !!(await page.$(`option::-p-text(${Sey.sizes[size]} - Sold Out)`))
    ) {
      throw new SkipError(
        `Size "${Sey.sizes[size]}" is sold out or does not exist`,
      );
    }
    const priceString = await page.$eval(
      `option::-p-text(${Sey.sizes[size]})`,
      (option: HTMLOptionElement) =>
        option.textContent!.trim().split(' - ')[1]!,
    );
    return currency(priceString).value;
  }

  async getTastingNotes(page: Page) {
    const description = await page.$$eval(
      'div.coffee_keyInfo_shortBlurb *',
      (nodes: Node[]) =>
        nodes
          .flatMap((node) => Array.from(node.childNodes))
          .find(
            (node) =>
              node.nodeType === Node.TEXT_NODE &&
              !(node.textContent ?? '<').startsWith('<'),
          )!.textContent!,
    );

    const [_, lastSentence] = description.split('.').reverse();

    return [`${lastSentence.trim()}.`];
  }

  async getUrls(page: Page) {
    await page.goto(`${Sey.url}/collections/coffee`);
    return page.$$eval(
      'div.coffees_products_product_inner > a',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .filter(
            (a) =>
              ![/instant/i, /set/i, /subscription/i].some((str) =>
                a
                  .querySelector('span.coffeeTitle_producer')!
                  .textContent!.trim()
                  .match(str),
              ),
          )
          .map(({ href }) => href),
    );
  }
}
