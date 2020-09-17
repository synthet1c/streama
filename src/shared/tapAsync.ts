export function tapAsync<X, Y>(fn: (x: X) => Promise<void>): (x: X) => Promise<X>;
export function tapAsync<X, Y>(fn: (x: X) => Promise<Y>): (x: X) => Promise<Y>;
export function tapAsync<X, Y>(fn: (x: X) => Promise<Y | void>) {
  return (x: X) => fn(x).then(y => y || x);
}

