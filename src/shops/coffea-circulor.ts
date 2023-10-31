import puppeteer from 'puppeteer';
import { limit } from '../utils/semaphore.js';
import { mapAsync, wait } from '../utils/async.js';

const DOMAIN = 'https://coffeacirculor.com';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(`${DOMAIN}/collections/all`);

while (await page.$('#section-collection a.block-fade')) {
  const moreProductsButton = (await page.$(
    '#section-collection a.block-fade',
  ))!;
  await moreProductsButton.click();
  await wait(1000);
}

const urls = await page.$$eval('a.product-item:not(:has(.sold))', (anchors) =>
  anchors.map((a) => a.href),
);

const unfilteredProducts = await mapAsync(
  urls,
  limit(10, async (url: string) => {
    const page = await browser.newPage();
    await page.goto(url);
    const sizes = await page.$$('[data-text^="250g"] span');

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

    if (!prices.length) {
      page.close();
      return;
    }

    const price = Math.min(...prices);

    const flavors = await page.$eval(
      'text/Flavor',
      (el) => el.nextElementSibling!.textContent!,
    );

    const name = await page.$eval('h1.product-title', (el) => el.textContent!);

    const score = Number(
      await page.$eval(
        'text/SCA SCORE',
        (el) => el.parentElement!.textContent!.split(/SCA SCORE\s/)[1],
      ),
    );

    await page.close();
    return { name, flavors, price, score, url };
  }),
);

const products = unfilteredProducts
  .filter((p) => p)
  .sort((a, b) => a.price - b.price)
  .filter(({ price }) => price <= 20);

console.log(products);

await browser.close();
