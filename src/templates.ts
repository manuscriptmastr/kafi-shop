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
            ({ country, name, new: isNew, price, tastingNotes, url }) =>
              `- [${name} (${country}, ${currency(price).format()})](${url}) ${
                isNew ? ' *NEW*' : ''
              }: ${tastingNotes.join(', ')}`,
          )
          .join('\n')
      : '_No coffees in this price range._';

  return `
*[${coffeeShop.name}](${coffeeShop.url})*
_Note: Prices reflect ${metadata.size} size._

*Low (< $15)*
${coffeesToList(coffees.filter(({ price }) => price < 15))}

*Mid ($15–$25)*
${coffeesToList(coffees.filter(({ price }) => price >= 15 && price < 25))}

*Feelin' bougie? ($25–30)*
${coffeesToList(coffees.filter(({ price }) => price >= 25 && price <= 30))}

*${coffeeShop.buyingTip}*
	`;
};

export const TEMPLATES = {
  [Template.Json]: jsonTemplate,
  [Template.Markdown]: markdownTemplate,
};
