# kafi-shop

Node.js shopping CLI for specialty coffee. Currently supports:

- [Apollon's Gold Specialty Coffee](https://shop.apollons-gold.com/)
- [Black & White Coffee](https://www.blackwhiteroasters.com/)
- [Blanchard's Coffee](https://blanchardscoffee.com/)
- [Ceremony Coffee Roasters](https://shop.ceremonycoffee.com/)
- [Coffea Circulor](https://coffeacirculor.com/)
- [Color Coffee Roasters](https://colorroasters.com/)
- [George Howell Coffee](https://georgehowellcoffee.com/)
- [Ilse Coffee](https://ilsecoffee.com/)
- [La Cabra](https://www.lacabra.dk/)
- [Luna](https://enjoylunacoffee.com/)
- [Manhattan Coffee Roasters](https://manhattancoffeeroasters.com/)
- [Monogram Coffee](https://monogramcoffee.com/en-us/)
- [Onyx Coffee Lab](https://onyxcoffeelab.com/)
- [Passenger](https://www.passengercoffee.com/)
- [Roseline Coffee](https://roselinecoffee.com/)
- [Sey](https://www.seycoffee.com/)

**Prices are converted to US dollars, but may not be completely accurate.**

## Installation

Clone repo, then:

```shell
cd {rootDir}
nvm use
npm install
# Compile TypeScript
npm run build
# Make CLI a shell command. Now you can run kafi-shop anywhere!
npm link
```

## CLI

```shell
kafi-shop <apollons-gold|black-and-white|blanchards|ceremony|coffea-circulor|color|george-howell|ilse|la-cabra|luna|manhattan|onyx|passenger|roseline|sey> [size] [template]
```

`kafi-shop sey --size 250g --template markdown` generates:

```md
**[Sey](https://www.seycoffee.com)**
_Note: Prices reflect 250g size._

- [Kanzu (Rwanda, $23.00)](https://www.seycoffee.com/collections/coffee/products/2023-kanzu-rwanda): In the cup we find purple fruit, baking spices, black tea, and citrus.
- [Huila (Colombia, $23.00)](https://www.seycoffee.com/collections/coffee/products/huila-decaffeinated): In the cup we find ripe berries, dark chocolate, and crème brûlée.
- [Peterson & Purity Muthathai (Kenya, $23.25)](https://www.seycoffee.com/collections/coffee/products/ngaratua-aa-2023): This lot is essentially pure SL28, and sings of dark fruits and citrus, with a subtle florality as well.
- [Misael Ochoa (Honduras, $23.50)](https://www.seycoffee.com/collections/coffee/products/2023-misael-ochoa-mis-penitas-honduras): In the cup we find soft florality, raspberry, and brown sugar.
- [Kadir Jabril (Ethiopia, $23.75)](https://www.seycoffee.com/collections/coffee/products/2023-kadir-jabril-wate-gogugu-ethiopia): In the cup we find intoxicating honeysuckle, passion fruit, and a lively citrus acidity.
- [José Martinez (Colombia, $23.75)](https://www.seycoffee.com/collections/coffee/products/2023-jose-martinez-el-casino-caturra-colombia): In the cup we find bright red fruit, crisp acidity, and a honey-like sweetness.
- [José Martinez (Colombia, $23.75)](https://www.seycoffee.com/collections/coffee/products/jose-martinez-late-2023): The cup is fruit-forward, with sparkling acidity and notes of pink grapefruit, mango, and berries.
- [Gildardo Lopez (Colombia, $23.75)](https://www.seycoffee.com/collections/coffee/products/gildardo-lopez-late-2023): In the cup we find a very expressive Pink Bourbon profile, with excellently articulated acidities of lemon, lime, ripe raspberry, and a hint of florality.
- [Yaye Chericho (Ethiopia, $25.25)](https://www.seycoffee.com/collections/coffee/products/2023-yaye-chericho-ethiopia): This coffee screams in the cup: ripe tropical fruit, lively acidities, and botanicals.
- [Duwancho (Ethiopia, $25.25)](https://www.seycoffee.com/collections/coffee/products/duwancho-washed-2023): In the cup we find lively acidity, watermelon, honeydew, and jasmine.

**Try out the monthly subscription for some pretty great savings + free shipping.**
```
