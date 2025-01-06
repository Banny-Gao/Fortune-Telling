export const ANIMAL_NAME = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const
export const DIRECTION_NAME = ['东', '南', '中', '西', '北'] as const

/** 生肖 */
export type AnimalName = NameConst<typeof ANIMAL_NAME>
export type Animal = IndexField<{
  name: AnimalName
}>
export const animals: Animal[] = ANIMAL_NAME.map((name, index) => ({
  name,
  index,
}))

/** 方位 */
export type DirectionName = NameConst<typeof DIRECTION_NAME>
export type Direction = IndexField<{
  name: DirectionName
}>
export const directions: Direction[] = DIRECTION_NAME.map((name, index) => ({
  name,
  index,
}))
