/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export const CACHES = new Map<symbol, any>()

export const CacheKey = {
  YIN_YANG: Symbol('yinYang'),
  WUXING: Symbol('wuxing'),
  TIAN_GAN: Symbol('tianGan'),
  DI_ZHI: Symbol('diZhi'),
  BAZI: Symbol('bazi'),
} as const

type CacheKey = (typeof CacheKey)[keyof typeof CacheKey]

export const getCache = <T>(key: CacheKey, getDefaultValue: () => T): T => {
  const cache = CACHES.get(key)
  if (cache) return cache
  const value = getDefaultValue()
  CACHES.set(key, value)
  return value
}

export const setCache = <T>(key: CacheKey, value: T): void => {
  CACHES.set(key, value)
}
