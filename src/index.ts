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

const metadata = { size: Size.TwoHundredFiftyGrams };

try {
  const products = await shop.getProducts(metadata);
  console.log(newsFeedTemplate(shop, products, metadata));
} catch (e: any) {
  console.log(e.message);
} finally {
  process.exit();
}
