import puppeteer from 'puppeteer';
import { mapAsync } from '../utils/async.js';
import { limit } from '../utils/semaphore.js';
import currency from 'currency.js';
import { Coffee } from '../models/coffee.ts';

const DOMAIN = 'https://onyxcoffeelab.com';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(`${DOMAIN}/collections/coffee`);

const urls = await page.$$eval(
  'a.product-preview[href^="/products/"]',
  (anchors) => anchors.map((a) => a.href),
);

const unfilteredProducts = await mapAsync(
  urls,
  limit(10, async (url: string): Promise<Coffee | null> => {
    const page = await browser.newPage();
    await page.goto(url);

    const size = await page.$('span.generic-option[data-value="10oz"]');

    if (!size) {
      page.close();
      return null;
    }

    await size.click();

    const priceText = await page.$eval('div.price.variant-price', (div) =>
      div.textContent!.trim(),
    );

    const price = currency(priceText).value;

    const name = await page.$eval('h1', (h1) => h1.firstChild!.textContent!);

    const score = await page.$eval(
      '[data-name="trans_cup_score"] p::-p-text(Cup Score)',
      (p) => Number(p.parentElement!.lastElementChild!.textContent!.trim()),
    );

    const flavors = await page.$eval(
      'div.image-features div.label::-p-text(Cup:) + div.value',
      (div) => div.textContent!.trim(),
    );

    await page.close();
    return { name, flavors, price, score, url };
  }),
);

const products = unfilteredProducts
  .filter((p) => p)
  .sort((a, b) => a.price - b.price);

console.log(products);

await browser.close();
