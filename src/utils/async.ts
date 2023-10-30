export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mapAsync = async <T, U>(list: T[], fn: (item: T) => Promise<U>) =>
  Promise.all(list.map(fn));
