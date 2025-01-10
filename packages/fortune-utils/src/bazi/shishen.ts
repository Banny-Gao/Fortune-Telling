import type { GanName } from './gan'
import type { ZhiName } from './zhi'

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
export type GanZhiShishen = Bijian | Jiecai | PianYin | ZhengYin | Qisha | Shangguan | Piancai | Zhengcai

/** 获取十神 */
export type TargetShishen = TargetField<{
  name: GanName | ZhiName
  targetName: GanName | ZhiName
  forTarget?: GanZhiShishen
  forMe?: GanZhiShishen
}>
