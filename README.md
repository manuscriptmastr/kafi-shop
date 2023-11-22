# kafi-shop

Node.js shopping CLI for specialty coffee. Currently supports:

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
npm run shop <coffea-circulor|manhattan|onyx|passenger|sey> [size] [template]
# Example:
npm run shop sey --size 250g --template markdown
```
