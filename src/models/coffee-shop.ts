import { Page } from 'puppeteer';
import { Coffee } from './coffee.js';

export interface CoffeeShop {
  getUrls: (page: Page) => Promise<string[]>;
  getProducts: () => Promise<Coffee[]>;
}
