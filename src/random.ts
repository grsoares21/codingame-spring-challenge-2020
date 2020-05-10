let seed = 5;

export function random(): number {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
