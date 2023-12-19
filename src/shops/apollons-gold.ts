import { CoffeeShopBase, CoffeeShopProperties, Size } from '@models/coffee.js';
import { SkipError } from '@utils';
import { ConversionRate } from 'constants.js';
import currency from 'currency.js';
import { Page } from 'puppeteer';

export class ApollonsGold
  extends CoffeeShopBase
  implements CoffeeShopProperties
{
  static buyingTip = 'Free international shipping on 1kg–2.5kg orders.';
  static defaultSize = Size.TwoHundredFiftyGrams;
  static name = "Apollon's Gold Specialty Coffee";
  static sizes: Partial<Record<Size, string>> = {
    [Size.OneHundredGrams]: '100g',
    [Size.TwoHundredFiftyGrams]: '250g',
  };
  static url = 'https://shop.apollons-gold.com';

  async getName(page: Page) {
    return page.$eval('h1', (h1: HTMLHeadingElement) => h1.textContent!.trim());
  }

  async getOrigin(page: Page) {
    return 'N/A';
  }

  async getPrice(page: Page, size: Size) {
    // Fixes a bug where price format is inconsistent until user clicks on an option.
    for (const size in ApollonsGold.sizes) {
      const option = await page.$(
        `.product-form__swatch__item[title="${size as Size}"] label`,
      );
      if (option) {
        await option.click();
      }
    }
    const option = await page.$(
      `.product-form__swatch__item[title="${ApollonsGold.sizes[size]}"] label`,
    );
    if (!option) {
      throw new SkipError(`Size "${ApollonsGold.sizes[size]}" does not exist`);
    }
    await option.click();
    const price = await page.$eval(
      'span.money:not(:has(span.money))',
      (span: HTMLSpanElement) => span.textContent!,
    );
    return currency(currency(price).multiply(ConversionRate.JPY_TO_USD).value)
      .value;
  }

  async getTastingNotes(page: Page) {
    return [];
  }

  async getUrls(page: Page) {
    await page.goto(`${ApollonsGold.url}/collections/frontpage`);
    return page.$$eval(
      '.product-card a.product-card__link',
      (anchors: HTMLAnchorElement[]) => [
        ...new Set(anchors.map((anchor) => anchor.href)),
      ],
    );
  }
}
