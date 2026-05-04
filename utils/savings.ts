export function calcSavings(fluxEur: number, wiseEur: number) {
  const diff = fluxEur - wiseEur
  const pct = wiseEur > 0 ? (diff / wiseEur) * 100 : 0
  return { diff, pct }
}
