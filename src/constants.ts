import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../../../');
export const CACHE_DIR = resolve(ROOT_DIR, 'cache');
