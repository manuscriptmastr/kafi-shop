import { ElementHandle, Page } from 'puppeteer';

export const autoScroll = async (page: Page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve(undefined);
        }
      }, 100);
    });
  });
};

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const capitalize = (str: string) => {
  const prefix = str.slice(0, 1);
  const suffix = str.slice(1);
  return `${prefix.toUpperCase()}${suffix}`;
};

export const clickOnElementManually = async (
  page: Page,
  elem: ElementHandle,
) => {
  const rect = await page.evaluate((el) => {
    const { top, left, width, height } = el.getBoundingClientRect();
    return { top, left, width, height };
  }, elem);

  // Use given position or default to center
  const x = rect.width / 2;
  const y = rect.height / 2;

  await page.mouse.click(rect.left + x, rect.top + y);
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
        dispatch();
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

export class SkipError extends Error {
  constructor(reason?: string) {
    super(reason);
    this.name = 'SkipError';
  }
}
