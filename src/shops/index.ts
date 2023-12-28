import { ApollonsGold } from './apollons-gold.js';
import { BlackAndWhite } from './black-and-white.js';
import { Blanchards } from './blanchards.js';
import { Ceremony } from './ceremony.js';
import { CoffeaCirculor } from './coffea-circulor.js';
import { Color } from './color.js';
import { GeorgeHowell } from './george-howell.js';
import { Ilse } from './ilse.js';
import { LaCabra } from './la-cabra.js';
import { Leuchtfeuer } from './leuchtfeuer.js';
import { Luna } from './luna.js';
import { Manhattan } from './manhattan.js';
import { Monogram } from './monogram.js';
import { Onyx } from './onyx.js';
import { Passenger } from './passenger.js';
import { Roseline } from './roseline.js';
import { Sey } from './sey.js';

export enum Shop {
  ApollonsGold = 'apollons-gold',
  BlackAndWhite = 'black-and-white',
  Blanchards = 'blanchards',
  Ceremony = 'ceremony',
  CoffeaCirculor = 'coffea-circulor',
  Color = 'color',
  GeorgeHowell = 'george-howell',
  Ilse = 'ilse',
  LaCabra = 'la-cabra',
  Leuchtfeuer = 'leuchtfeuer',
  Luna = 'luna',
  Manhattan = 'manhattan',
  Monogram = 'monogram',
  Onyx = 'onyx',
  Passenger = 'passenger',
  Roseline = 'roseline',
  Sey = 'sey',
}

export const SHOPS = {
  [Shop.ApollonsGold]: ApollonsGold,
  [Shop.BlackAndWhite]: BlackAndWhite,
  [Shop.Blanchards]: Blanchards,
  [Shop.Ceremony]: Ceremony,
  [Shop.CoffeaCirculor]: CoffeaCirculor,
  [Shop.Color]: Color,
  [Shop.GeorgeHowell]: GeorgeHowell,
  [Shop.Ilse]: Ilse,
  [Shop.LaCabra]: LaCabra,
  [Shop.Leuchtfeuer]: Leuchtfeuer,
  [Shop.Luna]: Luna,
  [Shop.Manhattan]: Manhattan,
  [Shop.Monogram]: Monogram,
  [Shop.Onyx]: Onyx,
  [Shop.Passenger]: Passenger,
  [Shop.Roseline]: Roseline,
  [Shop.Sey]: Sey,
};

export type CoffeeShop = (typeof SHOPS)[keyof typeof SHOPS];
