import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { SkipError, capitalize } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Manhattan extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip =
    'Free international shipping when you spend 165 euros. Great for small group orders!';
  static name = 'Manhattan Coffee Roasters';
  static sizes: Partial<Record<Size, string>> = {
    [Size.OneHundredTwentyFiveGrams]: '125 gram',
    [Size.TwoHundredFiftyGrams]: '250 gram',
    [Size.FiveHundredGrams]: '500 gram',
    [Size.OneKilogram]: '1000 gram',
  };
  static url = 'https://manhattancoffeeroasters.com';

  async getOrigin(page: Page) {
    const origin = await page.$eval('::-p-text(origin)', (el) =>
      el
        .parentElement!.parentElement!.querySelector('li.overflow-hidden')!
        .firstElementChild!.textContent!.trim(),
    );
    return capitalize(origin);
  }

  async getName(page: Page) {
    return page.$eval('h1', (h1) => h1.textContent!.trim());
  }

  async getPrice(page: Page, { size }: Metadata) {
    const priceText = await page.$eval(
      `::-p-text(${Manhattan.sizes[size]} whole coffee beans)`,
      (el) =>
        el.parentElement!.nextElementSibling!.firstElementChild!.textContent!.trim(),
    );

    return currency(priceText, {
      symbol: '',
      decimal: ',',
    }).value;
  }

  async getTastingNotes(page: Page) {
    const tastingNotes = await page.$eval('::-p-text(tastes like)', (el) =>
      Array.from(
        el.parentElement!.parentElement!.querySelectorAll('li.overflow-hidden'),
      ).map((el) => el.firstElementChild!.textContent!.trim()),
    );
    return tastingNotes.map(capitalize);
  }

  async getUrls(page: Page) {
    await page.goto(`${Manhattan.url}/catalog/coffee`);

    return page.$$eval(
      `a[href^="${Manhattan.url}/catalog/coffee/"]`,
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }

  async setupProductPage(page: Page) {
    const filterButton = await page.$('button::-p-text(Filter)');

    if (!filterButton) {
      throw new SkipError('Filter option does not exist');
    } else {
      await filterButton.click();
    }
  }
}
