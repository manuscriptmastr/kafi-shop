import { Coffee, Size } from '@models/coffee.js';
import { CoffeeShop } from '@shops/index.js';
import currency from 'currency.js';

export enum Template {
  Json = 'json',
  Markdown = 'markdown',
}

interface Metadata {
  previous?: Coffee[];
  size: Size;
}

export const jsonTemplate = (
  coffeeShop: CoffeeShop,
  coffees: Coffee[],
  { previous = [], size }: Metadata,
) =>
  coffees
    .filter(({ prices }) => (size === Size.None ? true : size in prices))
    .map((coffee) => ({
      ...coffee,
      new: !previous.some(({ url }) => coffee.url === url),
    }))
    .map(({ prices, ...coffee }) =>
      size === Size.None
        ? { ...coffee, prices }
        : { ...coffee, price: prices[size] },
    );

export const markdownTemplate = (
  coffeeShop: CoffeeShop,
  _coffees: Coffee[],
  { previous = [], size: _size }: Metadata,
) => {
  const coffees = _coffees.map((coffee) => ({
    ...coffee,
    new: !previous.some(({ url }) => coffee.url === url),
  }));
  const size = _size === Size.None ? coffeeShop.defaultSize : _size;
  const coffeesToList = (coffees: (Coffee & { new: boolean })[]) =>
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
