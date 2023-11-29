import { CACHE_DIR } from '@utils';
import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { resolve } from 'path';

export class Cache {
  async get<T>(key: string) {
    const dir = resolve(CACHE_DIR, key);
    try {
      const filenames = await readdir(dir);
      return filenames.length === 0
        ? undefined
        : (JSON.parse(
            await readFile(resolve(dir, filenames.at(-1)!), 'utf-8'),
          ) as T);
    } catch (e) {
      return undefined;
    }
  }

  async set<T>(key: string, value: T) {
    const unixTimestamp = Date.now();
    const dir = resolve(CACHE_DIR, key);
    await mkdir(dir, { recursive: true });
    await writeFile(
      resolve(dir, `${unixTimestamp}.json`),
      `${JSON.stringify(value, undefined, '  ')}\n`,
    );
  }
}
