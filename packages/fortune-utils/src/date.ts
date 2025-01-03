import dayjs from 'dayjs'
import { LUNAR_INFO } from './data/lunarYears'
import { getCurrentLoc, getLocation } from './utils/map'

import type { IndexField } from './types'

/** 四季 */
export const SEASON_NAME = ['春', '夏', '秋', '冬']
/** 农历月份 */
export const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
/** 农历日期 */
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
]
/** 二十四节气 */
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
]

/** 四季 */
export type Season = IndexField<{}>
export const seasons: Season[] = SEASON_NAME.map((name, index) => ({
  index,
  name,
}))

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
  date: Date
}
export type TrueSolarTimeResult = BaseDate<{
  format: (pattern?: string) => string
}>

/** 计算时差方程修正值（分钟） */
export const getEquationOfTime = (date: Date): number => {
  // 计算当年的第几天（1月1日为第0天）
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

  // 计算太阳角度（弧度），81是春分前的天数
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365
  // 时差方程：使用傅里叶级数近似
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
}

/** 计算真太阳时 */
export const getTrueSolarTime = async (date: Date, longitudeOrAddress?: number | string): Promise<TrueSolarTimeResult> => {
  let longitude: number
  if (longitudeOrAddress === undefined) {
    const { lng } = await getCurrentLoc()
    longitude = lng
  } else {
    longitude = typeof longitudeOrAddress === 'string' ? (await getLocation(longitudeOrAddress)).lng : longitudeOrAddress
  }

  // 北京标准时区的中央经线
  const standardMeridian = 120
  // 经度修正：每偏离中央经线1度对应4分钟时差（转换为秒）
  const longitudeCorrection = (longitude - standardMeridian) * 4 * 60

  // 将当前时间转换为秒计数
  const totalSeconds = date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds()
  // 应用经度修正和时差方程修正（时差方程转换为秒）
  const equationOfTime = getEquationOfTime(date) * 60
  const correctedSeconds = totalSeconds + longitudeCorrection + equationOfTime

  // 初始化日期变量
  let years = date.getFullYear()
  let months = date.getMonth() + 1
  let days = date.getDate()

  // 将秒转换为时分秒，处理负数情况
  let remainingSeconds = correctedSeconds
  if (remainingSeconds < 0) {
    remainingSeconds += 24 * 60 * 60 // 加一天的秒数
    days -= 1
    if (days === 0) {
      months -= 1
      if (months === 0) {
        months = 12
        years -= 1
      }
      days = new Date(years, months, 0).getDate()
    }
  }

  let hours = Math.floor(remainingSeconds / 3600)
  let minutes = Math.floor((remainingSeconds % 3600) / 60)
  let seconds = Math.floor(remainingSeconds % 60)

  // 处理时间跨越日期边界的情况
  if (hours >= 24) {
    hours -= 24
    days += 1
    // 检查月末
    const lastDayOfMonth = new Date(years, months, 0).getDate()
    if (days > lastDayOfMonth) {
      days = 1
      months += 1
      if (months > 12) {
        months = 1
        years += 1
      }
    }
  } else if (hours < 0) {
    hours += 24
    days -= 1
    if (days === 0) {
      months -= 1
      if (months === 0) {
        months = 12
        years -= 1
      }
      days = new Date(years, months, 0).getDate()
    }
  }

  const newDate = new Date(years, months - 1, days, hours, minutes, seconds)
  const format = (pattern?: string) => dayjs(newDate).format(pattern || 'YYYY-MM-DD HH:mm')

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
  solarDate: Date // 公历日期
  text: string // 农历日期文本
}>

/** 将公历日期转换为农历日期 */
export const solarToLunar = (date: Date): LunarDate => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 计算距离1900年1月31日的天数
  let offset = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000)

  let lunarYear = 1900
  let lunarMonth = 1
  let lunarDay = 1
  let isLeap = false

  // 计算年
  for (let i = 0; i < LUNAR_INFO.length && offset > 0; i++) {
    const daysInLunarYear = getLunarYearDays(LUNAR_INFO[i])
    if (offset < daysInLunarYear) break
    offset -= daysInLunarYear
    lunarYear++
  }

  // 计算月
  const lunarInfo = LUNAR_INFO[lunarYear - 1900]
  const leapMonth = getLeapMonth(lunarInfo)
  let daysInMonth = 0

  for (let i = 1; i <= 12 && offset > 0; i++) {
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
      --i
      isLeap = true
      daysInMonth = getLeapDays(lunarInfo)
    } else {
      daysInMonth = getLunarMonthDays(lunarInfo, i)
    }

    if (isLeap && i === leapMonth + 1) isLeap = false
    if (offset < daysInMonth) break

    offset -= daysInMonth
    lunarMonth++
  }

  // 计算日
  lunarDay = offset + 1

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // 农历日期文本 LUNAR_MONTH 是农历月份，LUNAR_DAY 是农历日期
  const text = `${lunarYear}年 ${LUNAR_MONTH[lunarMonth - 1]}月 ${LUNAR_DAY[lunarDay - 1]}`

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    hour,
    minute,
    second,
    isLeap,
    solarDate: date,
    date: new Date(lunarYear, lunarMonth - 1, lunarDay, hour, minute, second),
    text,
  }
}

/** 根据公历日期地点获取农历时间 */
export const getSolarAndLunarDate = async (date: Date, longitudeOrAddress?: number | string): Promise<LunarDate> => {
  //  获取真太阳时
  const solarTime = await getTrueSolarTime(date, longitudeOrAddress)

  // 转换为农历
  return solarToLunar(solarTime.date)
}

/** 计算黄经度数（角度） */
export const getSolarLongitude = (jd: number): number => {
  // TD = TT - UT1，这里使用近似值
  const td = (jd - 2451545.0) / 36525

  // 太阳轨道根数
  const L0 = 280.46645 + 36000.76983 * td + 0.0003032 * td * td // 平黄经
  const M = 357.5291 + 35999.0503 * td - 0.0001559 * td * td // 平近点角
  const e = 0.016708617 - 0.000042037 * td // 轨道离心率

  // 计算中心差
  const C =
    (1.9146 - 0.004817 * td - 0.000014 * td * td) * Math.sin((M * Math.PI) / 180) +
    (0.019993 - 0.000101 * td) * Math.sin((2 * M * Math.PI) / 180) +
    0.00029 * Math.sin((3 * M * Math.PI) / 180)

  // 真黄经
  const L = L0 + C

  return L % 360
}

/** 将日期转换为儒略日 */
export const getJulianDay = (date: Date): number => {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600

  let jd = 0
  let yy = y
  let mm = m

  if (m <= 2) {
    yy--
    mm += 12
  }

  const a = Math.floor(yy / 100)
  const b = 2 - a + Math.floor(a / 4)

  jd = Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + b - 1524.5 + h / 24
  return jd
}

/** 查找指定黄经度数对应的儒略日 */
export const findSolarTermJD = (targetLongitude: number, startJD: number, endJD: number): number => {
  const precision = 0.0001 // 精度：约8秒
  let low = startJD
  let high = endJD

  while (high - low > precision) {
    const mid = (low + high) / 2
    const longitude = getSolarLongitude(mid)

    if (Math.abs(longitude - targetLongitude) < precision) {
      return mid
    }

    if ((longitude - targetLongitude + 360) % 360 < 180) {
      high = mid
    } else {
      low = mid
    }
  }

  return (low + high) / 2
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

  return new Date(year, month - 1, day, hours, minutes, seconds)
}

/** 节气接口 */
export interface SolarTerm {
  // 节气名称
  name: string
  // 节气日期农历日期
  lunarDate: LunarDate
}

/** 获取农历某月某天当月的节气 */
export const getSolarTerms = (date: LunarDate): [SolarTerm, SolarTerm] => {
  const jd = getJulianDay(date.solarDate)
  const longitude = getSolarLongitude(jd)

  // 根据太阳黄经确定节气索引
  // 立春（315度）对应索引0，每个节气间隔15度
  const currentTermIndex = Math.floor(((longitude + 45) % 360) / 15)
  const nextTermIndex = (currentTermIndex + 1) % 24

  // 计算这两个节气的准确时间
  const currentTermLongitude = (currentTermIndex * 15 + 270) % 360
  const nextTermLongitude = (nextTermIndex * 15 + 270) % 360

  // 计算准确时间，扩大搜索范围
  const currentTermJD = findSolarTermJD(currentTermLongitude, jd - 20, jd + 20)
  const nextTermJD = findSolarTermJD(nextTermLongitude, currentTermJD, currentTermJD + 40)

  // 转换为日期
  const currentTermDate = fromJulianDay(currentTermJD)
  const nextTermDate = fromJulianDay(nextTermJD)

  // 创建节气对象
  const term1: SolarTerm = {
    name: SOLAR_TERM[currentTermIndex],
    lunarDate: solarToLunar(currentTermDate),
  }

  const term2: SolarTerm = {
    name: SOLAR_TERM[nextTermIndex],
    lunarDate: solarToLunar(nextTermDate),
  }

  return [term1, term2]
}
