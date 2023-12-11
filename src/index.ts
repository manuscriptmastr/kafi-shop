#!/usr/bin/env -S node
import { Size } from '@models/coffee.js';
import { SHOPS, Shop } from '@shops/index.js';
import { TEMPLATES, Template } from 'templates.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * @todo Use a plain function for getProducts() instead of extended class.
 * @todo Scrape all sizes from products, and use size option to filter results.
 */

interface UserInput {
  shop: Shop;
  size?: Size;
  template: Template;
}

// @ts-ignore
const input: UserInput = yargs(hideBin(process.argv))
  .scriptName('kafi-shop')
  .command('$0 <shop>', 'Shop for coffees', (yargs) =>
    yargs
      .positional('shop', {
        choices: Object.values(Shop),
        type: 'string',
      })
      .option('size', {
        choices: Object.values(Size),
        type: 'string',
      })
      .option('template', {
        choices: Object.values(Template),
        default: Template.Json,
        type: 'string',
      }),
  )
  .version(false).argv;

const shop = SHOPS[input.shop];
const template = TEMPLATES[input.template];
const size = input.size ?? shop.defaultSize;

if (!(size in shop.sizes)) {
  console.error(
    `Coffee shop "${
      shop.name
    }" does not have size "${size}". Try: ${Object.keys(shop.sizes)
      .map((size) => `"${size}"`)
      .join(', ')}.`,
  );
  process.exit();
}

const metadata = { size };

const products = await new shop().getProducts(metadata);
console.log(template(shop, products, metadata));
