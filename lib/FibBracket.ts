export const getFibBracketFrom21 = (value: number) => {
  let a = 13, b = 21
  while (b < value) { const next = a + b; a = b; b = next }
  const mid = value >= 21 ? Math.floor((a + b) / 2) : undefined
  return { prev: a, mid, current: b }
}