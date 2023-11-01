import { Page } from 'puppeteer';
import { Coffee } from './coffee.js';

export interface CoffeeShopLegacy {
  getProducts: () => Promise<Coffee[]>;
  getUrls: (page: Page) => Promise<string[]>;
}

export interface CoffeeShop {
  getTastingNotes: (page: Page) => Promise<string>;
  getName: (page: Page) => Promise<string>;
  getCuppingScore: (page: Page) => Promise<Number | 'N/A'>;
  getPrice: (page: Page) => Promise<Number>;
  getUrls: (page: Page) => Promise<string[]>;
  shouldSkipProduct: (page: Page) => Promise<boolean>;
}

export enum CoffeeShopEnum {
  CoffeaCirculor = 'coffea-circulor',
  Manhattan = 'manhattan',
  Onyx = 'onyx',
  Passenger = 'passenger',
}

export const coffeeShop = <T extends new (...args: any[]) => any>(
  Class: T,
  context: ClassDecoratorContext,
) =>
  class extends Class {
    async getProducts() {
      return [];
    }
  };
