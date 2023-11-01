import 'dotenv/config';
import { CoffeaCirculor } from './shops/coffea-circulor.js';
import { Manhattan } from './shops/manhattan.js';
import { Onyx } from './shops/onyx.js';
import { Passenger } from './shops/passenger.js';
import { CoffeeShopEnum } from './models/coffee-shop.js';

const SHOPS = {
  [CoffeaCirculor.id]: new CoffeaCirculor(),
  [CoffeeShopEnum.Manhattan]: new Manhattan(),
  [CoffeeShopEnum.Onyx]: new Onyx(),
  [CoffeeShopEnum.Passenger]: new Passenger(),
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
