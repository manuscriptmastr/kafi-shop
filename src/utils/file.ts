import { Coffee } from '@models/coffee.js';
import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../../../');
export const CACHE_DIR = resolve(ROOT_DIR, 'cache');

export const cacheProducts = async (folder: string, products: Coffee[]) => {
  const unixTimestamp = Date.now();
  const dir = resolve(CACHE_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(
    resolve(dir, `${unixTimestamp}.json`),
    `${JSON.stringify(products, undefined, '  ')}\n`,
  );
};

export const retrieveCache = async (folder: string, index = -1) => {
  const dir = resolve(CACHE_DIR, folder);
  try {
    const filenames = await readdir(dir);
    return filenames.length === 0
      ? undefined
      : (JSON.parse(
          await readFile(resolve(dir, filenames.at(index)!), 'utf-8'),
        ) as Coffee[]);
  } catch (e) {
    return undefined;
  }
};
