import { describe, it, expect } from 'vitest'
import { add } from './index'

describe('fortune-utils', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3)
  })
})
