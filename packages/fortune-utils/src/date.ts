import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { LUNAR_INFO } from './data/lunar-years'
import { getCurrentLoc, getLocation } from './utils/map'
import { toChineseNum } from './utils/number-to-chinese'
import localforage from 'localforage'

Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP })

/** 四季 */
export type SeasonName = NameConst<typeof SEASON_NAME>
export const SEASON_NAME = ['春', '夏', '秋', '冬'] as const

/** 农历月份 */
export type LunarMonth = NameConst<typeof LUNAR_MONTH>
export const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'] as const

/** 农历日期 */
export type LunarDay = NameConst<typeof LUNAR_DAY>
export const LUNAR_DAY = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
] as const

/** 二十四节气 */
export type SolarTermName = NameConst<typeof SOLAR_TERM>
export const SOLAR_TERM = [
  '立春',
  '雨水',
  '惊蛰',
  '春分',
  '清明',
  '谷雨',
  '立夏',
  '小满',
  '芒种',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '处暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
  '冬至',
  '小寒',
  '大寒',
] as const

/** 获取闰月月份 */
export const getLeapMonth = (lunarInfo: number): number => lunarInfo & 0xf

/** 获取闰月天数 */
export const getLeapDays = (lunarInfo: number): number => (getLeapMonth(lunarInfo) ? (lunarInfo & 0x10000 ? 30 : 29) : 0)

/** 计算农历年天数 */
export const getLunarYearDays = (lunarInfo: number): number => {
  let total = 0
  let monthInfo = 0x8000
  for (let i = 0; i < 12; i++) {
    total += lunarInfo & monthInfo ? 30 : 29
    monthInfo = monthInfo >> 1
  }

  return total + getLeapDays(lunarInfo)
}

/** 获取农历某月的天数 */
export const getLunarMonthDays = (lunarInfo: number, month: number): number => (lunarInfo & (0x10000 >> month) ? 30 : 29)

/** 真太阳时对象接口 */
type BaseDate<T> = T & {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  date?: Date
}
export type TrueSolarTimeResult = BaseDate<{
  date: Date
  format: (pattern?: string) => string
}>

/** 计算时差方程修正值（分钟） */
export const getEquationOfTime = (date: Date): number => {
  // 计算当年的第几天（1月1日为第0天）
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

  // 计算太阳角度（弧度），81是春分前的天数
  const B = new Decimal(dayOfYear - 81)
    .div(365)
    .times(2 * Math.PI)
    .toNumber()

  return new Decimal(9.87)
    .times(Math.sin(2 * B))
    .sub(new Decimal(7.53).times(Math.cos(B)))
    .sub(new Decimal(1.5).times(Math.sin(B)))
    .toNumber()
}

/** 计算真太阳时 */
export const getTrueSolarTime = async (date: Date, longitudeOrAddress?: number | string): Promise<TrueSolarTimeResult> => {
  // 1. 获取经度
  const longitude = await (async () => {
    if (!longitudeOrAddress) return (await getCurrentLoc()).lng
    return typeof longitudeOrAddress === 'string' ? (await getLocation(longitudeOrAddress)).lng : longitudeOrAddress
  })()

  // 2. 计算修正秒数
  const standardMeridian = 120
  const totalSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
  let correctedSeconds =
    totalSeconds +
    (longitude - standardMeridian) * 240 + // 4 * 60 = 240
    getEquationOfTime(date) * 60

  // 3. 处理日期计算
  let years = date.getFullYear()
  let months = date.getMonth() + 1
  let days = date.getDate()

  // 处理跨日
  if (correctedSeconds < 0) {
    correctedSeconds += 86400 // 24 * 3600
    days--
    if (days === 0) {
      months--
      if (months === 0) {
        months = 12
        years--
      }
      days = new Date(years, months, 0).getDate()
    }
  } else if (correctedSeconds >= 86400) {
    correctedSeconds -= 86400
    days++
    if (days > new Date(years, months, 0).getDate()) {
      days = 1
      months++
      if (months > 12) {
        months = 1
        years++
      }
    }
  }

  // 4. 计算时分秒
  const hours = Math.floor(correctedSeconds / 3600)
  const remainingSeconds = correctedSeconds % 3600
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = Math.round(remainingSeconds % 60) // 使用 round 处理小数

  const newDate = new Date(years, months - 1, days, hours, minutes, seconds)
  const format = (pattern?: string): string => dayjs(newDate).format(pattern || 'YYYY-MM-DD HH:mm')

  return {
    year: years,
    month: months,
    day: days,
    hour: hours,
    minute: minutes,
    second: seconds,
    format,
    date: newDate,
  }
}

/** 农历日期接口 */
export type LunarDate = BaseDate<{
  isLeap: boolean // 是否闰月
  solarDate: Date // 真太阳时日期
  text: string // 农历日期文本
  monthIndex: number // 当月在本年索引
  dateIndex: number // 当天在本月索引
}>

/** 将真太阳时转换为农历日期 */
export const solarToLunar = (date: Date): LunarDate => {
  const baseDate = new Date(1900, 0, 31)
  const offsetDays = Math.floor((date.getTime() - baseDate.getTime()) / 86400000)

  let lunarYear = 1900
  let daysRemaining = offsetDays
  let isLeap = false

  // 计算农历年
  while (lunarYear < 2100 && daysRemaining > 0) {
    const yearInfo = LUNAR_INFO[lunarYear - 1900]
    const yearDays = getLunarYearDays(yearInfo)

    if (daysRemaining < yearDays) break

    daysRemaining -= yearDays
    lunarYear++
  }

  // 计算农历月
  const yearInfo = LUNAR_INFO[lunarYear - 1900]
  const leapMonth = getLeapMonth(yearInfo)
  let lunarMonth = 0
  let monthDays = 0
  let leapProcessed = false

  for (let m = 1; m <= 12; m++) {
    // 先处理正常月份
    monthDays = getLunarMonthDays(yearInfo, m)
    if (daysRemaining < monthDays) {
      lunarMonth = m
      break
    }
    daysRemaining -= monthDays

    // 处理闰月（在正常月份之后）
    if (leapMonth === m && !leapProcessed) {
      const leapDays = getLeapDays(yearInfo)
      if (daysRemaining < leapDays) {
        lunarMonth = m
        isLeap = true
        leapProcessed = true
        break
      }
      daysRemaining -= leapDays
      leapProcessed = true
    }
  }

  // 计算农历日
  const lunarDay = daysRemaining + 1

  // 处理月份显示（移除错误的月份修正）
  let monthText: string = LUNAR_MONTH[lunarMonth - 1]
  if (isLeap) {
    monthText = `闰${monthText}`
  }
  const lunarYearText = toChineseNum(lunarYear)

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    isLeap,
    solarDate: date,
    text: `${lunarYearText}年 ${monthText}月 ${LUNAR_DAY[lunarDay - 1]}`,
    monthIndex: lunarMonth - 1,
    dateIndex: lunarDay - 1,
  }
}

/** 根据公历日期地点获取农历时间 */
export const getSolarAndLunarDate = async (date: Date, longitudeOrAddress?: number | string): Promise<LunarDate> => {
  //  获取真太阳时
  const solarTime = await getTrueSolarTime(date, longitudeOrAddress)

  // 转换为农历
  return solarToLunar(solarTime.date)
}

/**
 * 计算指定儒略日的太阳黄经
 * 使用天文算法计算太阳在黄道上的位置
 * @param jd 儒略日
 */
export function getSolarLongitude(jd: number): number {
  // 计算T是从J2000.0起的儒略世纪数
  const T = (jd - 2451545.0) / 36525
  const T2 = T * T
  const T3 = T2 * T

  // 太阳平黄经
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
  // 太阳平近点角
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T3

  // 太阳中心差
  const C =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin((M * Math.PI) / 180) +
    (0.019993 - 0.000101 * T) * Math.sin((2 * M * Math.PI) / 180) +
    0.00029 * Math.sin((3 * M * Math.PI) / 180)

  // 真黄经
  let theta = L0 + C

  // 把角度限制在0-360度之间
  theta = theta % 360
  if (theta < 0) {
    theta += 360
  }

  return theta
}

/** 将日期转换为儒略日 */
export const getJulianDay = (date: Date): number => {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const h = new Decimal(date.getHours()).plus(new Decimal(date.getMinutes()).div(60)).plus(new Decimal(date.getSeconds()).div(3600))

  let jd = 0
  let yy = y
  let mm = m

  if (m <= 2) {
    yy--
    mm += 12
  }

  const a = Math.floor(yy / 100)
  const b = 2 - a + Math.floor(a / 4)

  jd = Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + b - 1524.5 + h.div(24).toNumber()
  return jd
}

/** 查找指定黄经度数对应的儒略日 */
export const findSolarTermJD = (targetLongitude: number, startJD: number, endJD: number): number => {
  const precision = 0.0001
  let low = new Decimal(startJD)
  let high = new Decimal(endJD)
  let safetyCounter = 0 // 防止无限循环

  while (high.minus(low).gt(precision) && safetyCounter++ < 50) {
    const mid = low.plus(high).div(2)
    const longitude = getSolarLongitude(mid.toNumber())

    const currentDiff = new Decimal(longitude).minus(targetLongitude).mod(360)
    if (currentDiff.abs().lte(precision)) {
      return mid.toNumber()
    }

    // 修正方向判断逻辑
    const adjustedDiff = currentDiff.add(360).mod(360)
    adjustedDiff.lt(180) ? (high = mid) : (low = mid)
  }

  return low.plus(high).div(2).toNumber()
}

/** 儒略日转公历日期 */
export const fromJulianDay = (jd: number): Date => {
  const z = Math.floor(jd + 0.5)
  const a = Math.floor((z - 1867216.25) / 36524.25)
  const b = z + 1 + a - Math.floor(a / 4)
  const c = b + 1524
  const d = Math.floor((c - 122.1) / 365.25)
  const e = Math.floor(365.25 * d)
  const f = Math.floor((c - e) / 30.6001)

  const day = c - e - Math.floor(30.6001 * f)
  const month = f - 1 - 12 * Math.floor(f / 14)
  const year = d - 4715 - Math.floor((7 + month) / 10)

  const fraction = jd + 0.5 - z
  const hours = Math.floor(fraction * 24)
  const minutes = Math.floor((fraction * 24 - hours) * 60)
  const seconds = Math.floor(((fraction * 24 - hours) * 60 - minutes) * 60)

  // 创建UTC时间对象
  const utcDate = new Date(year, month - 1, day, hours, minutes, seconds)
  // 转换为中国标准时间（UTC+8）
  return new Date(utcDate.getTime() + 8 * 60 * 60 * 1000)
}

/** 节气接口 */
export interface SolarTerm {
  // 节气名称
  name: SolarTermName
  // 节气日期农历日期
  lunarDate: LunarDate
}

/** 获取指定年份的24节气 */
const yearSolarTermsMap = new Map<number, SolarTerm[]>()

// 配置 localforage
localforage.config({
  name: 'solar-terms-cache',
  storeName: 'solar_terms',
  description: '节气数据缓存',
})

export const getYearSolarTerms = async (year: number): Promise<SolarTerm[]> => {
  // 优先从缓存读取
  try {
    const cached = await localforage.getItem<SolarTerm[]>(`year_${year}`)
    if (cached) return cached
  } catch (err) {
    console.error('本地存储读取失败', err)
  }

  // 缓存未命中则计算
  const solarTerms: SolarTerm[] = []

  // 节气估算月份表 (立春到大寒对应的公历月份)
  const ESTIMATE_MONTHS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0]
  // 节气估算日期表 (每个节气的大致公历日期)
  const ESTIMATE_DAYS = [4, 19, 5, 20, 5, 20, 5, 21, 6, 21, 6, 22, 7, 22, 7, 23, 8, 23, 8, 23, 7, 22, 7, 5]

  for (let i = 0; i < 24; i++) {
    // 根据节气索引获取估算月份和日期
    const estimateMonth = ESTIMATE_MONTHS[i]
    const estimateDay = ESTIMATE_DAYS[i]

    // 处理跨年 (小寒、大寒属于下一年的节气)
    const actualYear = i >= 22 ? year + 1 : year

    // 创建估算日期
    const approxDate = new Date(actualYear, estimateMonth, estimateDay)
    const jd = getJulianDay(approxDate)

    // 计算精确的黄经位置 (立春开始每个节气间隔15度)
    const targetLongitude = (315 + i * 15) % 360

    // 查找精确的节气时间 (扩大搜索范围到前后30天)
    const termJD = findSolarTermJD(targetLongitude, jd - 30, jd + 30)
    const termDate = fromJulianDay(termJD)

    // 确保节气属于目标年份
    if (termDate.getFullYear() === year || (i >= 22 && termDate.getFullYear() === year + 1)) {
      const term: SolarTerm = {
        name: SOLAR_TERM[i],
        lunarDate: solarToLunar(termDate),
      }
      solarTerms.push(term)
    }
  }

  // 按时间排序
  const sortedSolarTerms = solarTerms.sort((a, b) => a.lunarDate.solarDate.getTime() - b.lunarDate.solarDate.getTime())
  yearSolarTermsMap.set(year, sortedSolarTerms)

  // 存储到缓存（永久有效）
  try {
    await localforage.setItem(`year_${year}`, sortedSolarTerms)
    yearSolarTermsMap.set(year, sortedSolarTerms)
  } catch (err) {
    console.error('本地存储失败', err)
  }

  return sortedSolarTerms
}

/** 获取某月某天前后的节气 */
export const getPrevAndNextSolarTerm = async (date: Date): Promise<[SolarTerm, SolarTerm]> => {
  const year = date.getFullYear()
  // 获取前年、当年、后年的节气（处理跨年边界情况）
  const [prevYearTerms, currentYearTerms, nextYearTerms] = await Promise.all([
    getYearSolarTerms(year - 1),
    getYearSolarTerms(year),
    getYearSolarTerms(year + 1),
  ])

  // 合并并排序所有相关节气（保留三年数据确保覆盖所有情况）
  const allTerms = [...prevYearTerms, ...currentYearTerms, ...nextYearTerms].sort((a, b) => a.lunarDate.solarDate.getTime() - b.lunarDate.solarDate.getTime())

  const targetTime = date.getTime()
  let prevTerm = allTerms[0]
  let nextTerm = allTerms[allTerms.length - 1]

  // 优化查找逻辑：从后往前找第一个小于目标时间的节气
  for (let i = allTerms.length - 1; i >= 0; i--) {
    const termTime = allTerms[i].lunarDate.solarDate.getTime()

    if (termTime <= targetTime) {
      prevTerm = allTerms[i]
      nextTerm = allTerms[i + 1] || allTerms[0] // 处理最后节气的情况
      break
    }
  }

  // 特殊处理年初情况（可能属于前一年的节气）
  if (date.getMonth() < 2) {
    // 1-3月需要检查前一年
    const firstTermOfYear = currentYearTerms[0]
    if (targetTime < firstTermOfYear.lunarDate.solarDate.getTime()) {
      prevTerm = prevYearTerms[prevYearTerms.length - 1]
      nextTerm = firstTermOfYear
    }
  }

  return [prevTerm, nextTerm]
}
