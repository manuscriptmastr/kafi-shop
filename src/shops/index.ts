import { Blanchards } from './blanchards.js';
import { Ceremony } from './ceremony.js';
import { CoffeaCirculor } from './coffea-circulor.js';
import { Manhattan } from './manhattan.js';
import { Onyx } from './onyx.js';
import { Passenger } from './passenger.js';
import { Sey } from './sey.js';

export enum Shop {
  Blanchards = 'blanchards',
  Ceremony = 'ceremony',
  CoffeaCirculor = 'coffea-circulor',
  Manhattan = 'manhattan',
  Onyx = 'onyx',
  Passenger = 'passenger',
  Sey = 'sey',
}

export const SHOPS = {
  [Shop.Blanchards]: Blanchards,
  [Shop.Ceremony]: Ceremony,
  [Shop.CoffeaCirculor]: CoffeaCirculor,
  [Shop.Manhattan]: Manhattan,
  [Shop.Onyx]: Onyx,
  [Shop.Passenger]: Passenger,
  [Shop.Sey]: Sey,
};

export type CoffeeShop = (typeof SHOPS)[keyof typeof SHOPS];
