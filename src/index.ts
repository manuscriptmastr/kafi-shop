// organize-imports-ignore
import 'dotenv/config';
import { Size } from '@models/coffee.js';
import { newsFeedTemplate } from 'templates.js';
import { CoffeeShopEnum, SHOPS } from '@shops/index.js';

/**
 * @todo This is hardcoded for now. Replace with CLI, such as:
 * ```shell
 * npm run shop sey --size 250g --template news-feed
 * ```
 */

const input = process.argv[2] as CoffeeShopEnum;

if (!Object.values(CoffeeShopEnum).includes(input)) {
  console.error(
    `Coffee shop "${input}" is not supported. Try: ${Object.values(
      CoffeeShopEnum,
    )
      .map((s) => `"${s}"`)
      .join(', ')}.`,
  );
  process.exit();
}

const shop = SHOPS[input];
const size = Size.TwoHundredFiftyGrams;

if (!(size in shop.sizes)) {
  throw new Error(
    `Coffee shop "${
      shop.name
    }" does not have size "${size}". Try: ${Object.keys(shop.sizes)
      .map((size) => `"${size}"`)
      .join(', ')}.`,
  );
}

const metadata = { size };

try {
  const products = await new shop().getProducts(metadata);
  console.log(newsFeedTemplate(shop, products, metadata));
} catch (e: any) {
  console.log(e.message);
} finally {
  process.exit();
}
