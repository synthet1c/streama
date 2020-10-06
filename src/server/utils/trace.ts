export const trace = (tag: string) => (x: any) => (console.log(tag, x), x);
