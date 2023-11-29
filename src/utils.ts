export const capitalize = (str: string) => {
  const prefix = str.slice(0, 1);
  const suffix = str.slice(1);
  return `${prefix.toUpperCase()}${suffix}`;
};

export let limit = <T extends (...args: any[]) => any>(max: number, fn: T) => {
  const Semaphore = <T extends (...args: any[]) => Promise<any>>(
    max: number,
  ) => {
    const tasks: ((value: unknown) => void)[] = [];
    let counter = max;

    let dispatch = () => {
      if (counter > 0 && tasks.length > 0) {
        counter--;
        // @ts-ignore
        tasks.shift()();
      }
    };

    const release = () => {
      counter++;
      dispatch();
    };

    const acquire = () =>
      new Promise((resolve) => {
        tasks.push(resolve);
        setImmediate(dispatch);
      });

    return async (fn: T) => {
      await acquire();
      let result: ReturnType<T> | undefined;
      try {
        result = await fn();
      } catch (e) {
        throw e;
      } finally {
        release();
      }
      return result;
    };
  };

  let semaphore = Semaphore(max);
  return (...args: Parameters<T>) => semaphore(() => fn(...args));
};

export const mapAsync = async <T, U>(list: T[], fn: (item: T) => Promise<U>) =>
  Promise.all(list.map(fn));
