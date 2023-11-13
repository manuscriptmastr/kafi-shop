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
*${shop} Coffees of the Day*

*Low prices (< $15)*
${coffees
  .filter(({ price }) => price < 15)
  .map(({ name, tastingNotes, url }) => `- [${name}](${url}): ${tastingNotes}`)
  .join('\n')}

*Mid prices ($15–$25)*
${coffees
  .filter(({ price }) => price >= 15 && price <= 25)
  .map(({ name, tastingNotes, url }) => `- [${name}](${url}): ${tastingNotes}`)
  .join('\n')}

*Feelin' bougie?*
${coffees
  .filter(({ price }) => price > 25 && price <= 30)
  .map(({ name, tastingNotes, url }) => `- [${name}](${url}): ${tastingNotes}`)
  .join('\n')}

Note: *Free international shipping when you buy 1kg!*
	`;
};
