import { Direction } from './types'

/** 方位 */
export const DIRECTION_NAME: Direction['name'][] = ['东', '南', '中', '西', '北']
export const directions: Direction[] = DIRECTION_NAME.map((name, index) => ({
  name,
  index,
}))
