/**
 * 解析字符串格式的尺寸 "{w,h}"
 */
export function parseSize(str: string): { w: number; h: number } {
  const match = str.match(/\{(-?\d+),(-?\d+)\}/)
  if (!match) throw new Error(`无效的尺寸格式: ${str}`)
  return { w: parseInt(match[1]), h: parseInt(match[2]) }
}

/**
 * 解析字符串格式的点 "{x,y}"
 */
export function parsePoint(str: string): { x: number; y: number } {
  const match = str.match(/\{(-?\d+),(-?\d+)\}/)
  if (!match) throw new Error(`无效的点格式: ${str}`)
  return { x: parseInt(match[1]), y: parseInt(match[2]) }
}

/**
 * 解析字符串格式的矩形 "{{x,y},{w,h}}"
 */
export function parseRect(str: string): { x: number; y: number; w: number; h: number } {
  const match = str.match(/\{\{(-?\d+),(-?\d+)\},\{(\d+),(\d+)\}\}/)
  if (!match) throw new Error(`无效的矩形格式: ${str}`)
  return {
    x: parseInt(match[1]),
    y: parseInt(match[2]),
    w: parseInt(match[3]),
    h: parseInt(match[4])
  }
}

