export const isBrowser = (): boolean => typeof window !== 'undefined'

export const getWindow = (): Window => {
  if (isBrowser()) {
    return window
  }

  return {} as Window
}
