interface il337Chars {
  [char: string]: string
}

const l337chars: il337Chars = {
  a: 'V',
  b: '8',
  c: ')',
  d: 'p',
  e: '3',
  f: '£',
  g: '9',
  h: 'y',
  i: '!',
  j: 'r',
  k: 'k',
  l: '1',
  m: 'w',
  n: 'u',
  o: '0',
  p: 'd',
  q: 'q',
  r: 'j',
  s: '5',
  t: 'L',
  u: 'n',
  v: 'A',
  w: 'm',
  x: 'x',
  y: 'h',
  z: 's',
  ' ': '-'
}

export const l337Crypt = (string: string): string =>
  string
    .split('')
    .reverse()
    .map((char: string) =>
      l337chars[char.toLowerCase()]
        ? l337chars[char.toLowerCase()]
        : char
    )
    .join('')
