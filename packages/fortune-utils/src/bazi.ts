import { wuxings, yinYangs } from './wuxing'
import { SOLAR_TERM, seasons, getSolarTerms, getSolarAndLunarDate } from './date'
import { animals, directions } from './constant'

import type { BasicField } from './types'
import type { LunarDate } from './date'

/** 十天干 */
export const GAN_NAME = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
/** 十二地支 */
export const ZHI_NAME = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
/** 四正（子午卯酉） */
export const ZHENG_ZHI_NAME = ['子', '午', '卯', '酉']
/** 四隅（寅申巳亥） */
export const SI_YU_NAME = ['寅', '申', '巳', '亥']
/** 四库（辰戌丑未）, 皆属土，依次分别为 水库 火库 金库 木库 */
export const SI_KU_NAME = ['辰', '戌', '丑', '未']
/** 十二长生 */
export const TWELVE_LONG_LIFE_NAME = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养']

/** 节气对应的月干偏移 */
export const SOLAR_TERM_OFFSET: Record<string, number> = Object.fromEntries(SOLAR_TERM.map((term, index) => [term, Math.floor(index / 2)]))

export type Gan = BasicField<{
  /** 天干
   * 阴阳交替
   * 甲乙东方木，丙丁南方火，戊己中央土，庚辛西方金，壬癸北方水
   */
  index: number // 索引
  name: string // 名称
  /*
   * 五虎遁: 年上起月，表示正月天干
   * 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚起，丁壬壬位顺行流，戊癸何方发，壬子是真途
   */
  wuhudun: {
    sourceName: (typeof GAN_NAME)[number] // 当前天干
    sourceIndex: number // 当前天干索引
    targetName: (typeof GAN_NAME)[number] // 正月天干
    targetIndex: number // 正月天干索引
  }
  /**
   * 五鼠遁: 日上起时，表示子时天干
   * 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
   */
  wushudun: {
    sourceName: (typeof GAN_NAME)[number] // 当前天干
    sourceIndex: number // 当前天干索引
    targetName: (typeof GAN_NAME)[number] // 子时天干
    targetIndex: number // 子时天干索引
  }
}>

export const gans: Gan[] = GAN_NAME.map((name, index) => {
  return {
    index,
    name,
    yinYang: yinYangs[index % 2],
    wuxing: wuxings[Math.floor(index / 2) % 5],
    direction: directions[Math.floor(index / 2) % 5],
    wuhudun: {
      sourceName: name,
      sourceIndex: index,
      targetName: GAN_NAME[((index + 1) % 5) * 2],
      targetIndex: ((index + 1) % 5) * 2,
    },
    wushudun: {
      sourceName: name,
      sourceIndex: index,
      targetName: GAN_NAME[(index % 5) * 2],
      targetIndex: (index % 5) * 2,
    },
  }
})

export type Zhi = BasicField<{
  index: number // 索引
  name: string // 名称
}>

/** 获取地支的五行 */
export const getZhiWuxing = (name: Zhi['name'], index: Zhi['index']) => {
  const offset = -2 + 12

  let wuxingIndex = (Math.floor((index + offset) / 3) % 4) % 12

  if (isInSiku(name)) {
    wuxingIndex = 2
  } else if (wuxingIndex >= 2) {
    wuxingIndex++
  }

  return wuxings[wuxingIndex]
}

/** 判断是否属于四正 */
export const isInZhengZhi = (name: Zhi['name']) => ZHENG_ZHI_NAME.includes(name)
/** 判断是否属于四隅 */
export const isInSiYu = (name: Zhi['name']) => SI_YU_NAME.includes(name)
/** 判断是否属于四库 */
export const isInSiku = (name: Zhi['name']) => SI_KU_NAME.includes(name)

export const zhis: Zhi[] = ZHI_NAME.map((name, index) => {
  return {
    name,
    index,
    yinYang: yinYangs[index % 2],
    wuxing: getZhiWuxing(name, index),
    direction: directions[Math.floor(index + 2) % 5],
    season: seasons[Math.floor((index + 2) % 3) % 4],
    animal: animals[index % 12],
  }
})

/** 获取年的天干 */
export const getYearGan = (year: number): Gan => {
  const index = (year - 4) % 10
  return gans[index]
}

/**获取年的地支 */
export const getYearZhi = (year: number): Zhi => {
  const index = (year - 4) % 12
  return zhis[index]
}

/** 获取某年某月某日节气的月干偏移 */
export const getMonthGanOffset = (lunarDate: LunarDate): number => {
  const [currentSolarTerm] = getSolarTerms(lunarDate)
  const solarTermOffset = SOLAR_TERM_OFFSET[currentSolarTerm.name]
  return solarTermOffset ?? lunarDate.month - 1
}

/** 获取农历某月某天所在的月的天干 */
export const getMonthGan = (lunarDate: LunarDate): Gan => {
  const yearGan = getYearGan(lunarDate.year)

  // 正月天干的序号
  const firstMonthGanIndex = yearGan.wuhudun.targetIndex
  // 月干偏移
  const monthOffset = getMonthGanOffset(lunarDate)

  const index = (firstMonthGanIndex + monthOffset) % 10
  return gans[index]
}

/** 获取农历某月某天所在的月的地支 */
export const getMonthZhi = (lunarDate: LunarDate): Zhi => {
  // 月干偏移
  const monthOffset = getMonthGanOffset(lunarDate)

  // 正月对应寅月，需要加上2个偏移
  const index = (monthOffset + 2) % 12
  return zhis[index]
}

export const getBazi = async (date: Date, address?: number | string) => {
  const lunarDate = await getSolarAndLunarDate(date, address)

  const yearGan = getYearGan(lunarDate.year)
  const yearZhi = getYearZhi(lunarDate.year)
  const monthGan = getMonthGan(lunarDate)
  const monthZhi = getMonthZhi(lunarDate)

  console.log('年干', yearGan)
  console.log('年支', yearZhi)
  console.log('月干', monthGan)
  console.log('月支', monthZhi)
}
