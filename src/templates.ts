import { CoffeeWithNewFlag, Metadata } from '@models/coffee.js';
import { CoffeeShop } from '@shops/index.js';
import currency from 'currency.js';

export enum Template {
  Json = 'json',
  Markdown = 'markdown',
}

export const jsonTemplate = (
  coffeeShop: CoffeeShop,
  coffees: CoffeeWithNewFlag[],
  metadata: Metadata,
) => coffees;

export const markdownTemplate = (
  coffeeShop: CoffeeShop,
  coffees: CoffeeWithNewFlag[],
  metadata: Metadata,
) => {
  const coffeesToList = (coffees: CoffeeWithNewFlag[]) =>
    coffees.length
      ? coffees
          .map(
            ({ name, new: isNew, origin, price, tastingNotes, url }) =>
              `- [${name} (${origin}, ${currency(price).format()})](${url}) ${
                isNew ? ' *NEW*' : ''
              }: ${tastingNotes.join(', ')}`,
          )
          .join('\n')
      : '_No coffees in this price range._';

  return `
*[${coffeeShop.name}](${coffeeShop.url})*
_Note: Prices reflect ${metadata.size} size._

${coffeesToList(coffees.slice(0, 30))}

*${coffeeShop.buyingTip}*
	`;
};

export const TEMPLATES = {
  [Template.Json]: jsonTemplate,
  [Template.Markdown]: markdownTemplate,
};
