export const peek = (tag: string) => (fn) => (x: any) => {
  const result = fn(x);
  console.log('peek', tag, x, result);
  return result;
};
