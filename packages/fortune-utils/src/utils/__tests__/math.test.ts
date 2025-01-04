import { describe, it, expect } from 'vitest'
import { gcd, lcm } from '../math'

describe('math utils', () => {
  describe('gcd', () => {
    it('should calculate greatest common divisor correctly', () => {
      expect(gcd(10, 12)).toBe(2)
      expect(gcd(15, 20)).toBe(5)
      expect(gcd(7, 13)).toBe(1)
    })
  })

  describe('lcm', () => {
    it('should calculate least common multiple correctly', () => {
      expect(lcm(10, 12)).toBe(60)
      expect(lcm(15, 20)).toBe(60)
      expect(lcm(7, 13)).toBe(91)
    })
  })
})
