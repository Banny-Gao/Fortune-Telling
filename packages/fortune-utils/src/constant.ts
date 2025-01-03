import type { IndexField } from './types'

export const ANIMAL_NAME = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
export const DIRECTION_NAME = ['东', '南', '中', '西', '北']

/** 生肖 */
export type Animal = IndexField<{}>
export const animals: Animal[] = ANIMAL_NAME.map((name, index) => ({
  name,
  index,
}))

/** 方位 */
export type Direction = IndexField<{}>
export const directions: Direction[] = DIRECTION_NAME.map((name, index) => ({
  name,
  index,
}))
