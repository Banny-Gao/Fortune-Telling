/** 中文数字字符 */
export type ChineseNum = '零' | '一' | '二' | '三' | '四' | '五' | '六' | '七' | '八' | '九'
export type ChineseUnit = '' | '十' | '百' | '千' | '万'

/** 数字对应的中文字符 */
export const CHINESE_NUMS: ChineseNum[] = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
export const CHINESE_UNITS: ChineseUnit[] = ['', '十', '百', '千', '万']

/**
 * 将数字转换为中文数字
 * @param num - 要转换的数字
 * @returns 中文数字字符串
 */
export const numToChinese = (num: number): string => {
  if (num === 0) return CHINESE_NUMS[0]
  if (num < 0) return `负${numToChinese(-num)}`

  // 处理十位数的特殊情况
  if (num >= 10 && num < 20) {
    return num === 10 ? CHINESE_UNITS[1] : `十${CHINESE_NUMS[num % 10]}`
  }

  const digits: number[] = []
  let tempNum = num
  while (tempNum > 0) {
    digits.unshift(tempNum % 10)
    tempNum = Math.floor(tempNum / 10)
  }

  let result = ''
  let needZero = false

  digits.forEach((digit, index) => {
    const position = digits.length - 1 - index

    if (digit === 0) {
      needZero = true
    } else {
      if (needZero && position !== 0) {
        result += CHINESE_NUMS[0]
      }
      result += CHINESE_NUMS[digit]
      if (position > 0) {
        result += CHINESE_UNITS[position % 5]
      }
      needZero = false
    }
  })

  return result
}

/**
 * 将中文数字转换为阿拉伯数字
 * @param chinese - 中文数字字符串
 * @returns 阿拉伯数字
 */
export const chineseToNum = (chinese: string): number => {
  const nums = new Map(CHINESE_NUMS.map((char, i) => [char, i]))
  const units = new Map(CHINESE_UNITS.map((char, i) => [char, Math.pow(10, i)]))

  let result = 0
  let temp = 0

  for (const char of chinese) {
    const num = nums.get(char as ChineseNum)
    const unit = units.get(char as ChineseUnit)

    if (num !== undefined) {
      temp = num
    } else if (unit !== undefined) {
      result += (temp || 1) * unit
      temp = 0
    }
  }

  return result + temp
}
