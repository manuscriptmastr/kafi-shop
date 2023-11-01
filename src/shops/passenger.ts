import { CoffeeShop, CoffeeShopProperties } from '@models/coffee.js';
import { wait } from '@utils/async.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

const DOMAIN = 'https://www.passengercoffee.com';

export class Passenger extends CoffeeShop implements CoffeeShopProperties {
  async getUrls(page: Page) {
    await page.goto(`${DOMAIN}/collections/coffee`);

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

  async shouldSkipProductPage(page: Page) {
    const size = await page.$(
      'label.swatch:has(input[name="Size"][value="10 oz"])',
    );

    if (!size) {
      return true;
    }

    await size.click();

    const isAddToCartDisabled = await page.$eval(
      'button[type=submit][name=add]',
      (button) => button.disabled,
    );

    if (isAddToCartDisabled) {
      return true;
    }

    return false;
  }

  async getPrice(page: Page) {
    await page.$('label.swatch:has(input[name="Size"][value="10 oz"])');

    const priceText = await page.$eval(
      '.product-top--details .product-top--details-price span[data-product-price]',
      (span) => span.textContent!.trim(),
    );

    return currency(priceText).value;
  }

  async getName(page: Page) {
    return page.$eval(
      '.product-top--details .product-label--title h2 span',
      (span) => span.textContent!.trim(),
    );
  }

  async getTastingNotes(page: Page) {
    return page.$$eval(
      '.product-top--details .product-label--notes ul li',
      (lis) => lis.map((li) => li.textContent!.trim()).join(', '),
    );
  }

  async getCuppingScore(page: Page): Promise<'N/A'> {
    return 'N/A';
  }
}
