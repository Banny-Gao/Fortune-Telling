/**
 * 计算最大公约数 (GCD)
 */
export const gcd = (a: number, b: number): number => {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y) {
    const temp = y
    y = x % y
    x = temp
  }

  return x
}

/**
 * 计算最小公倍数 (LCM)
 */
export const lcm = (a: number, b: number): number => {
  // lcm = (a * b) / gcd(a, b)
  return Math.abs(a * b) / gcd(a, b)
}
