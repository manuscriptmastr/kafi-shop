#!/usr/bin/env -S node
import { Size } from '@models/coffee.js';
import { Shop, SHOPS } from '@shops/index.js';
import { archiveProducts } from '@utils/file.js';
import { Template, TEMPLATES } from 'templates.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * @todo Dynamically determine size option default + choices from shop positional
 * @todo Add `new` property to coffees for "git diff"-style templating
 */

interface UserInput {
  shop: Shop;
  size: Size;
  template: Template;
}

// @ts-ignore
const {
  shop: shopInput,
  size,
  template: templateInput,
}: UserInput = yargs(hideBin(process.argv))
  .scriptName('kafi-shop')
  .command('$0 <shop> [size] [template]', 'Shop for coffees', (yargs) =>
    yargs
      .positional('shop', {
        choices: Object.values(Shop),
        type: 'string',
      })
      .option('size', {
        choices: Object.values(Size),
        default: Size.TwoHundredFiftyGrams,
        type: 'string',
      })
      .option('template', {
        choices: Object.values(Template),
        default: Template.Json,
        type: 'string',
      }),
  )
  .version(false).argv;

const shop = SHOPS[shopInput];
const template = TEMPLATES[templateInput];

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
await archiveProducts(shopInput, products);
console.log(template(shop, products, metadata));
