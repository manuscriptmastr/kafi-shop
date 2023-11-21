#!/usr/bin/env -S node
import { Size } from '@models/coffee.js';
import { CoffeeShopEnum, SHOPS } from '@shops/index.js';
import { newsFeedTemplate } from 'templates.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface UserInput {
  shop: CoffeeShopEnum;
  size: Size;
}

// @ts-ignore
const { shop: shopEnum, size }: UserInput = yargs(hideBin(process.argv))
  .option('shop', {
    choices: Object.values(CoffeeShopEnum),
    type: 'string',
  })
  .option('size', {
    choices: Object.values(Size),
    type: 'string',
  })
  .help()
  .version(false)
  .parseSync();

const shop = SHOPS[shopEnum];

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
  const products = await new shop().getProducts(metadata);
  console.log(newsFeedTemplate(shop, products, metadata));
} catch (e: any) {
  console.log(e.message);
} finally {
  process.exit();
}
