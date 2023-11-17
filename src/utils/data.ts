export const capitalize = (str: string) => {
  const prefix = str.slice(0, 1);
  const suffix = str.slice(1);
  return `${prefix.toUpperCase()}${suffix}`;
};
