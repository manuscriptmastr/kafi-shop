import {
  CoffeeShopBase,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { capitalize } from '@utils/data.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

/**
 * @todo Passenger just updated their site. Update this class.
 */
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
      '.product-top--details .product-label--region',
      (dd) => dd.textContent!.trim(),
    );
    return capitalize(country);
  }

  async getName(page: Page) {
    return page.$eval(
      '.product-top--details .product-label--title h2 span',
      (span) => span.textContent!.trim(),
    );
  }

  async getPrice(page: Page, { size }: Metadata) {
    await page.$(
      `label.swatch:has(input[name="Size"][value="${Passenger.sizes[size]}"])`,
    );

    const priceText = await page.$eval(
      '.product-top--details .product-top--details-price span[data-product-price]',
      (span) => span.textContent!.trim(),
    );

    return currency(priceText).value;
  }

  async getTastingNotes(page: Page) {
    return page.$$eval(
      '.product-top--details .product-label--notes ul li',
      (lis) => lis.map((li) => li.textContent!.trim()),
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
    const option = await page.$(
      `label.swatch:has(input[name="Size"][value="${Passenger.sizes[size]}"])`,
    );

    if (!option) {
      return true;
    }

    await option.click();

    const isAddToCartDisabled = await page.$eval(
      'button[type=submit][name=add]',
      (button) => button.disabled,
    );

    if (isAddToCartDisabled) {
      return true;
    }

    return false;
  }
}
