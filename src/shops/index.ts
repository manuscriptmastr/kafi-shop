import { CoffeaCirculor } from './coffea-circulor.js';
import { Manhattan } from './manhattan.js';
import { Onyx } from './onyx.js';
import { Passenger } from './passenger.js';
import { Sey } from './sey.js';

export enum CoffeeShopEnum {
  CoffeaCirculor = 'coffea-circulor',
  Manhattan = 'manhattan',
  Onyx = 'onyx',
  Passenger = 'passenger',
  Sey = 'sey',
}

export const SHOPS = {
  [CoffeeShopEnum.CoffeaCirculor]: CoffeaCirculor,
  [CoffeeShopEnum.Manhattan]: Manhattan,
  [CoffeeShopEnum.Onyx]: Onyx,
  [CoffeeShopEnum.Passenger]: Passenger,
  [CoffeeShopEnum.Sey]: Sey,
};

export type CoffeeShop = (typeof SHOPS)[keyof typeof SHOPS];
