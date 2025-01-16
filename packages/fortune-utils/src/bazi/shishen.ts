import { getGanWuxing, getGanYinYang, GAN_NAME } from './gan'
import { getZhiYinYang, getZhiWuxing, ZHI_NAME } from './zhi'

import type { GanName, Gan } from './gan'
import type { ZhiName, Zhi } from './zhi'

/** 十神 */
export type GanZhiShishenName = (typeof SHISHEN_NAME)[number][number]
export const SHISHEN_NAME = [
  ['比肩', '劫财'], // 同我者为比劫
  ['偏印', '正印'], // 生我者为枭印
  ['食神', '伤官'], // 我生者为食伤
  ['七杀', '正官'], // 克我者为官杀
  ['偏财', '正财'], // 我克者为财
] as const

type GetShishenType<M extends number, N extends number> = (typeof SHISHEN_NAME)[M][N]

export type Bijian = BasicField<{
  name: GetShishenType<0, 0>
}>
export type Jiecai = BasicField<{
  name: GetShishenType<0, 1>
}>
export type PianYin = BasicField<{
  name: GetShishenType<1, 0>
}>
export type ZhengYin = BasicField<{
  name: GetShishenType<1, 1>
}>
export type Shishen = BasicField<{
  name: GetShishenType<2, 0>
}>
export type Shangguan = BasicField<{
  name: GetShishenType<2, 1>
}>
export type Qisha = BasicField<{
  name: GetShishenType<3, 0>
}>
export type Zhengguan = BasicField<{
  name: GetShishenType<3, 1>
}>
export type Piancai = BasicField<{
  name: GetShishenType<4, 0>
}>
export type Zhengcai = BasicField<{
  name: GetShishenType<4, 1>
}>
export type GanZhiShishen = Bijian | Jiecai | PianYin | ZhengYin | Shishen | Shangguan | Qisha | Zhengguan | Piancai | Zhengcai

/** 获取十神 */
export type TargetShishen = TargetField<{
  name: GanName | ZhiName
  targetName: GanName | ZhiName
  forTarget?: GanZhiShishen
  forMe?: GanZhiShishen
}>

export function getShishen(this: Gan | Zhi, target?: Gan | Zhi | GanName | ZhiName): TargetShishen | TargetShishen[] | undefined {
  if (!target) return [...GAN_NAME, ...ZHI_NAME].map(item => getShishen.call(this, item)) as TargetShishen[]

  const targetName = typeof target === 'string' ? target : target.name
  const isGan = GAN_NAME.includes(targetName as GanName)
  const targetIndex = isGan ? GAN_NAME.indexOf(targetName as GanName) : ZHI_NAME.indexOf(targetName as ZhiName)
  const targetWuxing = isGan ? getGanWuxing(targetIndex) : getZhiWuxing(targetIndex)
  const targetYinYang = isGan ? getGanYinYang(targetIndex) : getZhiYinYang(targetIndex)

  const {
    wuxing: { name: meWuxingName },
  } = this
  const { name: targetWuxingName } = targetWuxing
  const { name: targetYinYangName } = targetYinYang

  const forMeIndex = [
    meWuxingName === targetWuxingName,
    this.wuxing.shengWo.targetName === targetWuxingName,
    this.wuxing.sheng.targetName === targetWuxingName,
    this.wuxing.keWo.targetName === targetWuxingName,
    this.wuxing.ke.targetName === targetWuxingName,
  ].findIndex(Boolean)

  const forTargetIndex = [
    targetWuxingName === meWuxingName,
    targetWuxing.shengWo.targetName === meWuxingName,
    targetWuxing.sheng.targetName === meWuxingName,
    targetWuxing.keWo.targetName === meWuxingName,
    targetWuxing.ke.targetName === meWuxingName,
  ].findIndex(Boolean)

  const i = this.yinYang.name === targetYinYangName ? 0 : 1

  return {
    name: this.name,
    index: this.index,
    targetName,
    targetIndex,
    forTarget: {
      name: SHISHEN_NAME[forTargetIndex][i],
    },
    forMe: {
      name: SHISHEN_NAME[forMeIndex][i],
    },
  }
}
