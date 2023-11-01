import currency from 'currency.js';
import { Page } from 'puppeteer';
import { CoffeeShop, CoffeeShopProperties } from '../models/coffee-shop.js';

const DOMAIN = 'https://manhattancoffeeroasters.com';

export class Manhattan extends CoffeeShop implements CoffeeShopProperties {
  async getUrls(page: Page) {
    await page.goto(`${DOMAIN}/catalog/coffee`);

    return page.$$eval(
      `a[href^="${DOMAIN}/catalog/coffee/"]`,
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href),
    );
  }

  async shouldSkipProductPage(page: Page) {
    return !(await page.$('button::-p-text(Filter)'));
  }

  async setupProductPage(page: Page) {
    const filterButton = (await page.$('button::-p-text(Filter)'))!;
    await filterButton.click();
  }

  async getPrice(page: Page) {
    const priceText = await page.$eval(
      '::-p-text(250 gram whole coffee beans)',
      (el) =>
        el.parentElement!.nextElementSibling!.firstElementChild!.textContent!.trim(),
    );

    return currency(priceText, {
      symbol: '',
      decimal: ',',
    }).value;
  }

  async getName(page: Page) {
    return page.$eval('h1', (h1) => h1.textContent!.trim());
  }

  async getTastingNotes(page: Page) {
    return page.$eval('::-p-text(tastes like)', (el) =>
      Array.from(
        el.parentElement!.parentElement!.querySelectorAll('li.overflow-hidden'),
      )
        .map((el) => el.firstElementChild!.textContent!.trim())
        .join(', '),
    );
  }

  async getCuppingScore(page: Page): Promise<'N/A'> {
    return 'N/A';
  }
}
