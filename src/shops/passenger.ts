import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError, capitalize } from '@utils';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class Passenger extends CoffeeShopBase implements CoffeeShopProperties {
  static buyingTip =
    'Free shipping on orders of $50 or more. Also, consider buying larger bags to drastically reduce overall costs.';
  static defaultSize = Size.TenOunces;
  static name = 'Passenger Coffee';
  static sizes: Partial<Record<Size, string>> = {
    [Size.FiveOunces]: '5 oz',
    [Size.TenOunces]: '10 oz',
    [Size.TwoPounds]: '2 lb',
    [Size.FivePounds]: '5 lb',
  };
  static url = 'https://www.passengercoffee.com';

  async getName(page: Page) {
    return page.$eval(
      '#mainContent .max-w-content h2.leading-none span',
      (span) => span.textContent!.trim(),
    );
  }

  async getOrigin(page: Page) {
    const origin = await page.$eval(
      '#mainContent .max-w-content .block.leading-none',
      (dd) => dd.textContent!.trim(),
    );
    return capitalize(origin);
  }

  async getPrice(page: Page, size: Size) {
    const option = await page.$(`text/${Passenger.sizes[size]}`);
    if (!option) {
      throw new SkipError(`Size "${Passenger.sizes[size]}" does not exist`);
    }

    await option.click();
    await page.waitForNetworkIdle();

    if (await page.$('text/Currently Unavailable')) {
      throw new SkipError(`Size "${Passenger.sizes[size]}" is sold out`);
    }

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
      const productsLength = await page.$$eval(
        '#mainContent a.w-full[href^="/products/"]',
        (anchors: HTMLAnchorElement[]) => anchors.length,
      );
      await page.click('text/Load more products');
      await page.waitForFunction(
        (len) =>
          document.querySelectorAll('#mainContent a.w-full[href^="/products/"]')
            .length > len,
        undefined,
        productsLength,
      );
    }

    return page.$$eval(
      '#mainContent a.w-full[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .filter(
            (a) =>
              ![
                /bundle/i,
                /necessary/i,
                /instant/i,
                /lots/i,
                /set/i,
                /subscription/i,
              ].some((str) => a.textContent!.trim().match(str)),
          )
          .map((a) => a.href),
    );
  }
}
