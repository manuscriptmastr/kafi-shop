const Semaphore = <T extends (...args: any[]) => Promise<any>>(max: number) => {
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

export let limit = <T extends (...args: any[]) => any>(max: number, fn: T) => {
  let semaphore = Semaphore(max);
  return (...args: Parameters<T>) => semaphore(() => fn(...args));
};

export default Semaphore;
