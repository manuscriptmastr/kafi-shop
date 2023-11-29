export const mapAsync = async <T, U>(list: T[], fn: (item: T) => Promise<U>) =>
  Promise.all(list.map(fn));
