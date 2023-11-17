import { CoffeeShop, CoffeeShopProperties } from '@models/coffee.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

const DOMAIN = 'https://www.seycoffee.com';

export class Sey extends CoffeeShop implements CoffeeShopProperties {
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

  async getName(page: Page) {
    return page.$eval(
      'span.coffeeTitle_producer',
      (span: HTMLSpanElement) => span.textContent!,
    );
  }

  async getCuppingScore(page: Page) {
    return 'N/A' as const;
  }

  async getPrice(page: Page) {
    const priceString = await page.$eval(
      'option::-p-text(250g)',
      (option: HTMLOptionElement) =>
        option.textContent!.trim().split(' - ')[1]!,
    );
    return currency(priceString).value;
  }

  async getUrls(page: Page) {
    await page.goto(`${DOMAIN}/collections/coffee`);
    return page.$$eval(
      'div.coffees_products_product_inner > a',
      (anchors: HTMLAnchorElement[]) => anchors.map(({ href }) => href),
    );
  }

  async shouldSkipProductPage(page: Page) {
    return !!(await page.$('option::-p-text(250g - Sold Out)'));
  }
}
