import { wuxings, yinYangs, getWuXing } from '../wuxing'
import { getRelation } from '../global'

import type { WuXing, YinYang, WuXingName } from '../wuxing'

/** 十天干 */
export type GanName = NameConst<typeof GAN_NAME>
export const GAN_NAME = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const

/** 天干五合 */
export const GAN_HE = [
  ['甲', '己', '土', '中正'],
  ['乙', '庚', '金', '仁义'],
  ['丙', '辛', '水', '威制'],
  ['丁', '壬', '木', '淫慝'],
  ['戊', '癸', '火', '无情'],
] as const
export type GanHeDescription = (typeof GAN_HE)[number][3]
export type GanHe = TargetField<{
  name: GanName
  description: GanHeDescription
  hua?: WuXing
}>
/** thisArg, 不可为箭头函数 */
export function ganHe(this: Gan, target?: Gan | GanName): GanHe | undefined {
  target ??= GAN_NAME[(this.index + 5) % 10]
  const transform = ([_, _name2, hua, description]: string[]): Required<Omit<GanHe, keyof TargetField>> =>
    ({
      description: description as GanHeDescription,
      hua: getWuXing(hua as WuXingName) as WuXing,
    }) as Required<Omit<GanHe, keyof TargetField>>

  return getRelation.call(this, {
    target,
    nameArray: [...GAN_NAME],
    relationArray: GAN_HE.map(item => [...item]),
    transform,
  }) as GanHe
}

/** 天干相冲 */
export const GAN_CHONG = [
  ['甲', '庚'],
  ['乙', '辛'],
  ['丙', '壬'],
  ['丁', '癸'],
] as const
export type GanChong = TargetField<{
  name: GanName
  targetName: GanName
}>
export function ganChong(this: Gan, target?: Gan | GanName): GanChong | undefined {
  target ??= GAN_NAME[(this.index + 6) % 10]
  return getRelation.call(this, {
    target,
    nameArray: [...GAN_NAME],
    relationArray: GAN_CHONG.map(item => [...item]),
  }) as GanChong
}

/** 十二长生 todo */
export type TwelveLongLifeName = NameConst<typeof TWELVE_LONG_LIFE_NAME>
export const TWELVE_LONG_LIFE_NAME = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'] as const

/** 天干接口 */
export type Gan = IndexField<{
  name: GanName
  /** 天干
   * 阴阳交替
   * 甲乙东方木，丙丁南方火，戊己中央土，庚辛西方金，壬癸北方水
   */
  yinYang: YinYang
  wuxing: WuXing
  /*
   * 五虎遁: 年上起月，表示正月天干
   * 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚起，丁壬壬位顺行流，戊癸何方发，壬子是真途
   * targetName: 正月天干
   */
  wuhudun: TargetField
  /**
   * 五鼠遁: 日上起时，表示子时天干
   * 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
   * targetName: 子时天干
   */
  wushudun: TargetField
  /** 合 */
  he: ReturnType<typeof ganHe>
  HE: typeof ganHe
  /** 冲 */
  chong: ReturnType<typeof ganChong>
  CHONG: typeof ganChong
}>
/** 十天干 */
export const gans: Gan[] = GAN_NAME.map((name, index) => {
  const gan = {
    index,
    name,
    yinYang: yinYangs[(index + 1) % 2],
    wuxing: wuxings[Math.floor(index / 2) % 5],
    wuhudun: {
      name,
      index,
      targetName: GAN_NAME[((index + 1) % 5) * 2],
      targetIndex: ((index + 1) % 5) * 2,
    },
    wushudun: {
      name,
      index,
      targetName: GAN_NAME[(index % 5) * 2],
      targetIndex: (index % 5) * 2,
    },
    HE: ganHe,
    CHONG: ganChong,
  } as Gan
  gan.he = ganHe.call(gan)
  gan.chong = ganChong.call(gan)

  return gan
})
console.log('十天干：', gans)
