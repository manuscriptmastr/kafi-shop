import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import { Page } from 'puppeteer';

export class CoffeaCirculor
  extends CoffeeShopBase
  implements CoffeeShopProperties
{
  static buyingTip =
    'Free international shipping (and sample) when you buy 1kg.';
  static defaultSize = Size.TwoHundredFiftyGrams;
  static name = 'Coffea Circulor';
  static sizes: Partial<Record<Size, string>> = {
    [Size.FortyGrams]: '40g',
    [Size.OneHundredGrams]: '100g',
    [Size.TwoHundredFiftyGrams]: '250g',
    [Size.OneKilogram]: '1kg',
  };
  static url = 'https://coffeacirculor.com';

  async getCuppingScore(page: Page) {
    return Number(
      await page.$eval(
        'text/SCA SCORE',
        (el) => el.parentElement!.textContent!.split(/SCA SCORE\s/)[1],
      ),
    );
  }

  async getName(page: Page) {
    return page.$eval('h1.product-title', (el) => el.textContent!);
  }

  async getOrigin(page: Page) {
    return page.$eval('text/Country', (el) =>
      el.nextElementSibling!.textContent!.trim(),
    );
  }

  async getPrice(page: Page, size: Size) {
    const sizes = await page.$$(
      `[data-text^="${CoffeaCirculor.sizes[size]}"] span`,
    );

    const prices = [];

    for (const size of sizes) {
      await size.click();
      const isAddToCartDisabled = await page.$eval(
        'button[name="add"]',
        (button) => button.disabled,
      );
      if (!isAddToCartDisabled) {
        const price = await page.$eval(
          'span.product-price',
          (el) => +el.textContent!.slice(1).replace(',', '') / 100,
        );

        prices.push(price);
      }
    }

    if (prices.length) {
      return Math.min(...prices);
    } else {
      throw new SkipError(`Size "${CoffeaCirculor.sizes[size]}" is sold out`);
    }
  }

  async getTastingNotes(page: Page) {
    return page.$eval('text/Flavor', (el) =>
      el.nextElementSibling!.textContent!.trim().split(/,\s/),
    );
  }

  async getUrls(page: Page) {
    await page.goto(`${CoffeaCirculor.url}/collections/all`);

    while (await page.$('#section-collection a.block-fade')) {
      const moreProductsButton = (await page.$(
        '#section-collection a.block-fade',
      ))!;
      await moreProductsButton.click();
      await page.waitForFunction(
        () =>
          !document.querySelector('#section-collection a.block-fade.loading'),
      );
    }

    return page.$$eval(
      'a.product-item:not(:has(.sold))',
      (anchors: HTMLAnchorElement[]) =>
        anchors
          .filter(
            (a) =>
              ![/bag/i, /hyperfood/i, /poster/i, /-set/i, /shirt/i].some(
                (pattern) => pattern.test(a.href),
              ),
          )
          .map((a) => a.href),
    );
  }
}
