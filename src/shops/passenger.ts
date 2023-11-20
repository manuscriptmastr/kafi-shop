import {
  CoffeeShop,
  CoffeeShopProperties,
  Metadata,
  Size,
} from '@models/coffee.js';
import { wait } from '@utils/async.js';
import { capitalize } from '@utils/data.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

const sizeMappings: Partial<Record<Size, string>> = {
  [Size.FiveOunces]: '5 oz',
  [Size.TenOunces]: '10 oz',
  [Size.TwoPounds]: '2 lb',
  [Size.FivePounds]: '5 lb',
};

export class Passenger extends CoffeeShop implements CoffeeShopProperties {
  url = 'https://www.passengercoffee.com';
  name = 'Passenger Coffee';
  buyingTip =
    'Free shipping on orders of $50 or more. Also, consider buying larger bags to drastically reduce overall costs.';
  sizes = [Size.FiveOunces, Size.TenOunces, Size.TwoPounds, Size.FivePounds];

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
      `label.swatch:has(input[name="Size"][value="${sizeMappings[size]}"])`,
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
    await page.goto(`${this.url}/collections/coffee`);

    await page.waitForNetworkIdle();
    await wait(3000);

    return page.$$eval(
      'div.product-data:not(:has(.sold-out)) a[href^="/products/"]',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .filter((a) => !/instant/gi.test(a.textContent!))
          .filter((a) => !/decaf/gi.test(a.textContent!))
          .map((a) => a.href),
    );
  }

  async shouldSkipProductPage(page: Page, { size }: Metadata) {
    const option = await page.$(
      `label.swatch:has(input[name="Size"][value="${sizeMappings[size]}"])`,
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
