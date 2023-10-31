import puppeteer from 'puppeteer';
import { limit } from '../utils/semaphore.js';
import currency from 'currency.js';
import { mapAsync } from '../utils/async.js';

const DOMAIN = 'https://manhattancoffeeroasters.com';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`${DOMAIN}/catalog/coffee`);

  const urls = await page.$$eval(
    `a[href^="${DOMAIN}/catalog/coffee/"]`,
    (anchors) => anchors.map((a) => a.href),
  );

  const unfilteredProducts = await mapAsync(
    urls,
    limit(10, async (url) => {
      const page = await browser.newPage();
      await page.goto(url);

      const filterButton = await page.$('button::-p-text(Filter)');

      if (!filterButton) {
        page.close();
        return;
      }

      await filterButton.click();

      const priceText = await page.$eval(
        '::-p-text(250 gram whole coffee beans)',
        (el) =>
          el.parentElement!.nextElementSibling!.firstElementChild!.textContent!.trim(),
      );

      const price = currency(priceText, {
        symbol: '',
        decimal: ',',
      }).value;

      const name = await page.$eval('h1', (h1) => h1.textContent!.trim());

      const flavors = await page.$eval('::-p-text(tastes like)', (el) =>
        Array.from(
          el.parentElement!.parentElement!.querySelectorAll(
            'li.overflow-hidden',
          ),
        )
          .map((el) => el.firstElementChild!.textContent!.trim())
          .join(', '),
      );

      await page.close();
      return { name, flavors, price, score: 'N/A', url };
    }),
  );

  const products = unfilteredProducts
    .filter((p) => p)
    .sort((a, b) => a.price - b.price);

  console.log(products);

  await browser.close();
})();
