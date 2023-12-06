import { BlackAndWhite } from './black-and-white.js';
import { Blanchards } from './blanchards.js';
import { Ceremony } from './ceremony.js';
import { CoffeaCirculor } from './coffea-circulor.js';
import { GeorgeHowell } from './george-howell.js';
import { Luna } from './luna.js';
import { Manhattan } from './manhattan.js';
import { Onyx } from './onyx.js';
import { Passenger } from './passenger.js';
import { Sey } from './sey.js';

export enum Shop {
  BlackAndWhite = 'black-and-white',
  Blanchards = 'blanchards',
  Ceremony = 'ceremony',
  CoffeaCirculor = 'coffea-circulor',
  GeorgeHowell = 'george-howell',
  Luna = 'luna',
  Manhattan = 'manhattan',
  Onyx = 'onyx',
  Passenger = 'passenger',
  Sey = 'sey',
}

export const SHOPS = {
  [Shop.BlackAndWhite]: BlackAndWhite,
  [Shop.Blanchards]: Blanchards,
  [Shop.Ceremony]: Ceremony,
  [Shop.CoffeaCirculor]: CoffeaCirculor,
  [Shop.GeorgeHowell]: GeorgeHowell,
  [Shop.Luna]: Luna,
  [Shop.Manhattan]: Manhattan,
  [Shop.Onyx]: Onyx,
  [Shop.Passenger]: Passenger,
  [Shop.Sey]: Sey,
};

export type CoffeeShop = (typeof SHOPS)[keyof typeof SHOPS];
