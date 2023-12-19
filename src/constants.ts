import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../../');
export const CACHE_DIR = resolve(ROOT_DIR, 'cache');

export enum ConversionRate {
  EURO_TO_USD = 1.1,
  JPY_TO_USD = 0.007,
}
