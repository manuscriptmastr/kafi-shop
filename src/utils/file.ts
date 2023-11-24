import { Coffee, CoffeeError } from '@models/coffee.js';
import { Shop } from '@shops/index.js';
import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const rootDir = resolve(fileURLToPath(import.meta.url), '../../../');

export const archiveProducts = async (
  shop: Shop,
  products: (Coffee | CoffeeError)[],
) => {
  const unixTimestamp = Date.now();
  const dir = resolve(rootDir, 'archives', shop);
  await mkdir(dir, { recursive: true });
  await writeFile(
    resolve(dir, `${shop}-${unixTimestamp}.json`),
    `${JSON.stringify(products, undefined, '  ')}\n`,
  );
};
