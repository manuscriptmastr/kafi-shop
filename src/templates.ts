import { CoffeeWithNewFlag, Size } from '@models/coffee.js';
import { CoffeeShop } from '@shops/index.js';
import currency from 'currency.js';

export enum Template {
  Json = 'json',
  Markdown = 'markdown',
}

interface Metadata {
  size: Size;
}

export const jsonTemplate = (
  coffeeShop: CoffeeShop,
  coffees: CoffeeWithNewFlag[],
  metadata: Metadata,
) =>
  coffees
    .filter(({ prices }) =>
      metadata.size === Size.None ? true : metadata.size in prices,
    )
    .map(({ prices, ...coffee }) =>
      metadata.size === Size.None
        ? { ...coffee, prices }
        : { ...coffee, price: prices[metadata.size] },
    );

export const markdownTemplate = (
  coffeeShop: CoffeeShop,
  coffees: CoffeeWithNewFlag[],
  metadata: Metadata,
) => {
  const size =
    metadata.size === Size.None ? coffeeShop.defaultSize : metadata.size;
  const coffeesToList = (coffees: CoffeeWithNewFlag[]) =>
    coffees.length
      ? coffees
          .filter(({ prices }) => size in prices)
          .map(
            ({ name, new: isNew, origin, prices, tastingNotes, url }) =>
              `- [${name} (${origin}, ${currency(
                // @ts-ignore
                prices[size],
              ).format()})](${url}) ${
                isNew ? ' *NEW*' : ''
              }: ${tastingNotes.join(', ')}`,
          )
          .join('\n')
      : '_No coffees in this price range._';

  return `
*[${coffeeShop.name}](${coffeeShop.url})*
_Note: Prices reflect ${size} size._

${coffeesToList(coffees.slice(0, 30))}

*${coffeeShop.buyingTip}*
	`;
};

export const TEMPLATES = {
  [Template.Json]: jsonTemplate,
  [Template.Markdown]: markdownTemplate,
};
