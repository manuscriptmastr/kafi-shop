// organize-imports-ignore
import 'dotenv/config';
import { CoffeeShopEnum, CoffeeShopProperties, Size } from '@models/coffee.js';
import { CoffeaCirculor } from '@shops/coffea-circulor.js';
import { Manhattan } from '@shops/manhattan.js';
import { Onyx } from '@shops/onyx.js';
import { Passenger } from '@shops/passenger.js';
import { Sey } from '@shops/sey.js';
import { newsFeedTemplate } from 'templates.js';

const SHOPS: { [K in CoffeeShopEnum]: CoffeeShopProperties } = {
  [CoffeeShopEnum.CoffeaCirculor]: new CoffeaCirculor(),
  [CoffeeShopEnum.Manhattan]: new Manhattan(),
  [CoffeeShopEnum.Onyx]: new Onyx(),
  [CoffeeShopEnum.Passenger]: new Passenger(),
  [CoffeeShopEnum.Sey]: new Sey(),
};

const input = process.argv[2] as CoffeeShopEnum;

if (!Object.values(CoffeeShopEnum).includes(input)) {
  console.error(
    `"${input}" is not supported. Currently supported shops: ${Object.values(
      CoffeeShopEnum,
    )
      .map((s) => `"${s}"`)
      .join(', ')}.`,
  );
  process.exit();
}

const shop = SHOPS[input];
const size = Size.TwoHundredFiftyGrams;

/**
 * @todo This is hardcoded for now. Replace with CLI, such as:
 * ```shell
 * npm run shop sey --size 250g --template news-feed
 * ```
 */

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
  const products = await shop.getProducts(metadata);
  console.log(newsFeedTemplate(shop, products, metadata));
} catch (e: any) {
  console.log(e.message);
} finally {
  process.exit();
}
