import { SOLAR_TERM_OFFSET } from '../bazi'
import { SOLAR_TERM } from '../date'

/**
 * 计算黄经度数（角度）
 * @param jd 儒略日
 * @returns 太阳黄经度数
 */
const getSolarLongitude = (jd: number): number => {
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

/**
 * 将日期转换为儒略日
 */
const getJulianDay = (date: Date): number => {
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

type SolarTermType = keyof typeof SOLAR_TERM_OFFSET

/** 获取节气 */
export const getSolarTerm = (date: Date): SolarTermType | undefined => {
  const jd = getJulianDay(date)
  const longitude = getSolarLongitude(jd)

  // 每个节气间隔15度
  const termIndex = Math.floor((longitude + 15) / 15) % 24

  // 检查是否在节气点附近（±0.5度）
  const diff = Math.abs(longitude - termIndex * 15)
  if (diff <= 0.5 || diff >= 14.5) {
    return SOLAR_TERM[termIndex] as SolarTermType
  }

  return undefined
}
