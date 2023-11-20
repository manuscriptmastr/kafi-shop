import { Coffee, CoffeeError, CoffeeShopProperties } from '@models/coffee.js';
import currency from 'currency.js';

export const newsFeedTemplate = (
  coffeeShop: CoffeeShopProperties,
  coffeesOrErrors: (Coffee | CoffeeError)[],
) => {
  const coffees = coffeesOrErrors.filter(
    (coffee) => !('error' in coffee),
  ) as Coffee[];

  const coffeesToList = (coffees: Coffee[]) =>
    coffees.length
      ? coffees
          .map(
            ({ country, name, price, tastingNotes, url }) =>
              `- [${name} (${country}, ${currency(
                price,
              ).format()})](${url}): ${tastingNotes.join(', ')}`,
          )
          .join('\n')
      : '_No coffees in this price range._';

  return `
*[${coffeeShop.name}](${coffeeShop.url})*
_Note: Prices reflect 250g size._

*Low (< $15)*
${coffeesToList(coffees.filter(({ price }) => price < 15))}

*Mid ($15–$25)*
${coffeesToList(coffees.filter(({ price }) => price >= 15 && price < 25))}

*Feelin' bougie? ($25–30)*
${coffeesToList(coffees.filter(({ price }) => price >= 25 && price <= 30))}

*${coffeeShop.buyingTip}*
	`;
};
