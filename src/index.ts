import 'dotenv/config';
import { readdir } from 'fs/promises';
import { dirname, parse } from 'path';
import { fileURLToPath } from 'url';

const SHOPS = (
  await readdir(`${dirname(fileURLToPath(import.meta.url))}/shops`)
).map((file) => parse(file).name);

const SHOP = process.argv[2];

if (!SHOPS.includes(SHOP)) {
  console.error(
    `"${SHOP}" is not supported. Currently supported shops: ${SHOPS.map(
      (s) => `"${s}"`,
    ).join(', ')}`,
  );
  process.exit();
}

await import(`./shops/${SHOP}.js`);
