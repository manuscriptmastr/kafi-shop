import coffees from './coffea-circulor/1694610188459.json' assert { type: 'json' };

const coffeesTable = Object.entries(coffees)
  .map(([name, { '250g': weight, url }]) => ({
    name,
    price: weight,
    url: `https://coffeacirculor.com/${url}`,
  }))
  .filter(({ price }) => !!price)
  .map(({ price, ...coffee }) => ({
    price: Number(price.slice(1).replace(',', '')) / 100,
    ...coffee,
  }))
  .sort((a, b) => a.price - b.price)
  .filter(({ price }) => price <= 18);

console.log(coffeesTable);
