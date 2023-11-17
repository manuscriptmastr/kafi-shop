// organize-imports-ignore
import 'dotenv/config';
import { CoffeeShopEnum, CoffeeShopProperties } from '@models/coffee.js';
import { CoffeaCirculor } from '@shops/coffea-circulor.js';
import { Manhattan } from '@shops/manhattan.js';
import { Onyx } from '@shops/onyx.js';
import { Passenger } from '@shops/passenger.js';
import { Sey } from '@shops/sey.js';

const SHOPS: { [K in CoffeeShopEnum]: CoffeeShopProperties } = {
  [CoffeeShopEnum.CoffeaCirculor]: new CoffeaCirculor(),
  [CoffeeShopEnum.Manhattan]: new Manhattan(),
  [CoffeeShopEnum.Onyx]: new Onyx(),
  [CoffeeShopEnum.Passenger]: new Passenger(),
  [CoffeeShopEnum.Sey]: new Sey(),
};

const shop = process.argv[2] as CoffeeShopEnum;

if (!Object.values(CoffeeShopEnum).includes(shop)) {
  console.error(
    `"${shop}" is not supported. Currently supported shops: ${Object.values(
      CoffeeShopEnum,
    )
      .map((s) => `"${s}"`)
      .join(', ')}`,
  );
  process.exit();
}

const products = await SHOPS[shop].getProducts();

console.log(products);
