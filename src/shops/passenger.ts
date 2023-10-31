import puppeteer, { Page } from 'puppeteer';
import { mapAsync, wait } from '../utils/async.js';
import { limit } from '../utils/semaphore.js';
import currency from 'currency.js';
import { Coffee } from '../models/coffee.js';
import { CoffeeShop } from '../models/coffee-shop.js';

const DOMAIN = 'https://www.passengercoffee.com';

export class Passenger implements CoffeeShop {
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

  async getProducts() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const urls = await this.getUrls(page);

    const unfilteredProducts: Coffee[] = await mapAsync(
      urls,
      limit(10, async (url: string): Promise<Coffee | null> => {
        const page = await browser.newPage();
        await page.goto(url);

        const size = await page.$(
          'label.swatch:has(input[name="Size"][value="10 oz"])',
        );

        if (!size) {
          page.close();
          return null;
        }

        await size.click();

        const isAddToCartDisabled = await page.$eval(
          'button[type=submit][name=add]',
          (button) => button.disabled,
        );

        if (isAddToCartDisabled) {
          page.close();
          return null;
        }

        const priceText = await page.$eval(
          '.product-top--details .product-top--details-price span[data-product-price]',
          (span) => span.textContent!.trim(),
        );

        const price = currency(priceText).value;

        const name = await page.$eval(
          '.product-top--details .product-label--title h2 span',
          (span) => span.textContent!.trim(),
        );

        const flavors = await page.$$eval(
          '.product-top--details .product-label--notes ul li',
          (lis) => lis.map((li) => li.textContent!.trim()).join(', '),
        );

        await page.close();
        return { name, flavors, price, score: 'N/A', url };
      }),
    );

    const products = unfilteredProducts
      .filter((p) => p)
      .sort((a, b) => a.price - b.price);
    await browser.close();
    return products;
  }
}
