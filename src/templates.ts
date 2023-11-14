import {
  Coffee,
  CoffeeError,
  CoffeeShopEnum,
  getCoffeeShopName,
} from '@models/coffee.js';

export const newsFeedTemplate = (
  coffeeShop: CoffeeShopEnum,
  coffeesOrErrors: (Coffee | CoffeeError)[],
) => {
  const shop = getCoffeeShopName(coffeeShop);
  const coffees = coffeesOrErrors.filter(
    (coffee) => !coffee.hasOwnProperty('error'),
  ) as Coffee[];

  return `
*${shop}*
_Note: prices reflect 250g size._

*Low (< $15)*
${coffees
  .filter(({ price }) => price < 15)
  .map(
    ({ name, tastingNotes, url }) =>
      `- [${name}](${url}): ${tastingNotes.join(', ')}`,
  )
  .join('\n')}

*Mid ($15–$25)*
${coffees
  .filter(({ price }) => price >= 15 && price < 25)
  .map(
    ({ name, tastingNotes, url }) =>
      `- [${name}](${url}): ${tastingNotes.join(', ')}`,
  )
  .join('\n')}

*Feelin' bougie?*
${coffees
  .filter(({ price }) => price >= 25 && price <= 30)
  .map(
    ({ name, tastingNotes, url }) =>
      `- [${name}](${url}): ${tastingNotes.join(', ')}`,
  )
  .join('\n')}
	`;
};
