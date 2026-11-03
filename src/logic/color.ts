/** Mistura uma cor hexadecimal com preto (amount > 0) ou branco (amount < 0). */
export function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16)
  const target = amount > 0 ? 0 : 255
  const ratio = Math.abs(amount)
  const channel = (shift: number) => Math.round(((value >> shift) & 255) * (1 - ratio) + target * ratio)
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}
