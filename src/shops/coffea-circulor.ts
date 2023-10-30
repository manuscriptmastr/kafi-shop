import puppeteer, { ElementHandle } from 'puppeteer';
import { limit } from '../utils/semaphore';
import { wait } from '../utils/async';

const PRODUCT = {
  DOMAIN: 'https://coffeacirculor.com',
  LIST: {
    DETAIL: {
      SELECTOR: 'a.product-item:not(:has(.sold))',
    },
    MORE: {
      SELECTOR: '#section-collection a.block-fade',
    },
    URL: 'https://coffeacirculor.com/collections/all',
  },
  DETAIL: {
    ADD_TO_CART: {
      SELECTOR: 'button[name="add"]',
    },
    FLAVOR: {
      SELECTOR: 'text/Flavor',
    },
    NAME: {
      SELECTOR: 'h1.product-title',
    },
    PRICE: {
      SELECTOR: 'span.product-price',
    },
    SIZE: {
      SELECTOR: '[data-text^="250g"] span',
    },
    SCORE: {
      SELECTOR: 'text/SCA SCORE',
    },
  },
};

(async () => {
  const startTime = performance.now();
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(PRODUCT.LIST.URL);

  while (await page.$(PRODUCT.LIST.MORE.SELECTOR)) {
    const moreProductsButton = await page.$(PRODUCT.LIST.MORE.SELECTOR);
    await moreProductsButton.click();
    await wait(1000);
  }

  const productDetailCards = await page.$$(PRODUCT.LIST.DETAIL.SELECTOR);

  const unfilteredProducts = await Promise.all(
    productDetailCards.map(
      limit(10, async (card: ElementHandle) => {
        const path = await card.evaluate((el) => el.getAttribute('href'));
        const url = `${PRODUCT.DOMAIN}${path}`;
        const page = await browser.newPage();
        await page.goto(url);
        const sizes = await page.$$(PRODUCT.DETAIL.SIZE.SELECTOR);

        const prices = [];

        for (const size of sizes) {
          await size.click();
          const addToCartButton = await page.$(
            PRODUCT.DETAIL.ADD_TO_CART.SELECTOR,
          );
          //@ts-ignore
          if (!(await addToCartButton.evaluate((el) => el.disabled))) {
            const price = await (
              await page.$(PRODUCT.DETAIL.PRICE.SELECTOR)
            ).evaluate((el) => +el.textContent.slice(1).replace(',', '') / 100);

            prices.push(price);
          }
        }

        if (!prices.length) {
          page.close();
          return;
        }

        const price = Math.min(...prices);

        const flavors = await (
          await page.$(PRODUCT.DETAIL.FLAVOR.SELECTOR)
        ).evaluate((el) => el.nextElementSibling.textContent);

        const name = await (
          await page.$(PRODUCT.DETAIL.NAME.SELECTOR)
        ).evaluate((el) => el.textContent);

        const score = await (
          await page.$(PRODUCT.DETAIL.SCORE.SELECTOR)
        ).evaluate(
          (el) => el.parentElement.textContent.split(/SCA SCORE\s/)[1],
        );

        await page.close();
        return { name, flavors, price, score, url };
      }),
    ),
  );

  const products = unfilteredProducts
    .filter((p) => p)
    .sort((a, b) => a.price - b.price)
    .filter(({ price }) => price <= 20);
  console.log(products);

  await browser.close();
  console.log(`Took ${performance.now() - startTime}ms`);
})();
