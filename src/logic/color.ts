/** Mistura uma cor hexadecimal com preto (amount > 0) ou branco (amount < 0). */
export function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16)
  const target = amount > 0 ? 0 : 255
  const ratio = Math.abs(amount)
  const channel = (shift: number) => Math.round(((value >> shift) & 255) * (1 - ratio) + target * ratio)
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}

/** Mistura duas cores hexadecimais: t = 0 dá `from`, t = 1 dá `to`. */
export function mixHex(from: string, to: string, t: number): string {
  const a = Number.parseInt(from.slice(1), 16)
  const b = Number.parseInt(to.slice(1), 16)
  const channel = (shift: number) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t)
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}
