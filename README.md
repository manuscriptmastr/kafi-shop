# kafi-shop

Node.js shopping CLI for specialty coffee. Currently supports:

- [Blanchard's Coffee](https://blanchardscoffee.com/)
- [Coffea Circulor](https://coffeacirculor.com/)
- [Manhattan Coffee Roasters](https://manhattancoffeeroasters.com/)
- [Onyx Coffee Lab](https://onyxcoffeelab.com/)
- [Passenger](https://www.passengercoffee.com/)
- [Sey](https://www.seycoffee.com/)

## Installation

Clone repo, then:

```shell
cd {rootDir}
nvm use
npm install
# Compile TypeScript
npm run build
# Make CLI entrypoint executable
chmod +x ./dist/index.js
```

## CLI

```shell
npm run shop <blanchards|coffea-circulor|manhattan|onyx|passenger|sey> [size] [template]
```

`npm run shop sey --size 250g --template markdown` generates:

```md
**[Sey](https://www.seycoffee.com)**
_Note: Prices reflect 250g size._

**Low (< $15)**
_No coffees in this price range._

**Mid ($15–$25)**

- [Kanzu (Rwanda, $23.00)](https://www.seycoffee.com/collections/coffee/products/2023-kanzu-rwanda): In the cup we find purple fruit, baking spices, black tea, and citrus.
- [Huila (Colombia, $23.00)](https://www.seycoffee.com/collections/coffee/products/huila-decaffeinated): In the cup we find ripe berries, dark chocolate, and crème brûlée.
- [Peterson & Purity Muthathai (Kenya, $23.25)](https://www.seycoffee.com/collections/coffee/products/ngaratua-aa-2023): This lot is essentially pure SL28, and sings of dark fruits and citrus, with a subtle florality as well.
- [Misael Ochoa (Honduras, $23.50)](https://www.seycoffee.com/collections/coffee/products/2023-misael-ochoa-mis-penitas-honduras): In the cup we find soft florality, raspberry, and brown sugar.
- [Kadir Jabril (Ethiopia, $23.75)](https://www.seycoffee.com/collections/coffee/products/2023-kadir-jabril-wate-gogugu-ethiopia): In the cup we find intoxicating honeysuckle, passion fruit, and a lively citrus acidity.
- [José Martinez (Colombia, $23.75)](https://www.seycoffee.com/collections/coffee/products/2023-jose-martinez-el-casino-caturra-colombia): In the cup we find bright red fruit, crisp acidity, and a honey-like sweetness.
- [José Martinez (Colombia, $23.75)](https://www.seycoffee.com/collections/coffee/products/jose-martinez-late-2023): The cup is fruit-forward, with sparkling acidity and notes of pink grapefruit, mango, and berries.
- [Gildardo Lopez (Colombia, $23.75)](https://www.seycoffee.com/collections/coffee/products/gildardo-lopez-late-2023): In the cup we find a very expressive Pink Bourbon profile, with excellently articulated acidities of lemon, lime, ripe raspberry, and a hint of florality.

**Feelin' bougie? ($25–30)**

- [Yaye Chericho (Ethiopia, $25.25)](https://www.seycoffee.com/collections/coffee/products/2023-yaye-chericho-ethiopia): This coffee screams in the cup: ripe tropical fruit, lively acidities, and botanicals.
- [Duwancho (Ethiopia, $25.25)](https://www.seycoffee.com/collections/coffee/products/duwancho-washed-2023): In the cup we find lively acidity, watermelon, honeydew, and jasmine.

**Try out the monthly subscription for some pretty great savings + free shipping.**
```
