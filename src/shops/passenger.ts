import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { capitalize } from '@utils/data.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Passenger extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip =
    'Free shipping on orders of $50 or more. Also, consider buying larger bags to drastically reduce overall costs.';
  static name = 'Passenger Coffee';
  static sizes: Partial<Record<Size, string>> = {
    [Size.FiveOunces]: '5 oz',
    [Size.TenOunces]: '10 oz',
    [Size.TwoPounds]: '2 lb',
    [Size.FivePounds]: '5 lb',
  };
  static url = 'https://www.passengercoffee.com';

  async getCountry(page: Page) {
    const country = await page.$eval(
      '#mainContent .max-w-content .block.leading-none',
      (dd) => dd.textContent!.trim(),
    );
    return capitalize(country);
  }

  async getName(page: Page) {
    return page.$eval(
      '#mainContent .max-w-content h2.leading-none span',
      (span) => span.textContent!.trim(),
    );
  }

  async getPrice(page: Page, { size }: Metadata) {
    const option = (await page.$(`text/${Passenger.sizes[size]}`))!;
    await option.click();
    await page.waitForNetworkIdle();
    const priceText = await page.$eval(
      `#mainContent .max-w-content span::-p-text($)`,
      (span: HTMLSpanElement) => span.textContent!.trim(),
    );

    return currency(priceText).value;
  }

  async getTastingNotes(page: Page) {
    return page.$eval('text/with notes of', (dd) =>
      Array.from(dd.firstElementChild!.childNodes).map((lis) =>
        lis.textContent!.trim(),
      ),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${Passenger.url}/collections/coffee`);

    while (await page.$('text/Load more products')) {
      await page.click('text/Load more products');
      await page.waitForNetworkIdle();
    }

    return page.$$eval(
      '#mainContent a.w-full[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .filter((a) => !/instant/gi.test(a.textContent!))
          .filter((a) => !/set/gi.test(a.textContent!))
          .filter((a) => !/necessary/gi.test(a.textContent!))
          .map((a) => a.href),
    );
  }

  async shouldSkipProductPage(page: Page, { size }: Metadata) {
    const option = await page.$(`text/${Passenger.sizes[size]}`);

    if (!option) {
      return true;
    }

    await option.click();
    await page.waitForNetworkIdle();

    if (await page.$('text/Currently Unavailable')) {
      return true;
    }

    return false;
  }
}
