import { MaxRectsPacker, PACKING_LOGIC } from 'maxrects-packer'
import type { ImageInfo } from '@/types/image'
import type { SpritePackerOptions } from '@/types/sprite'

export interface PackedFrame {
  img: ImageInfo
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
}

export interface PackedLayout {
  width: number
  height: number
  frames: PackedFrame[]
}

function nextPowerOfTwo(value: number): number {
  if (value <= 0) return 0
  return Math.pow(2, Math.ceil(Math.log2(value)))
}

/**
 * 简单行排列算法
 */
export function simplePack(
  images: ImageInfo[],
  options: SpritePackerOptions = {}
): PackedLayout {
  const { padding = 0, maxWidth = 4096 } = options

  const sortedImages = [...images].sort((a, b) => (b.width * b.height) - (a.width * a.height))

  let currentX = 0
  let currentY = 0
  let rowHeight = 0
  let totalWidth = 0
  let totalHeight = 0

  const frames: PackedFrame[] = []

  for (const img of sortedImages) {
    if (currentX + img.width + padding > maxWidth && currentX > 0) {
      currentX = 0
      currentY += rowHeight + padding
      rowHeight = 0
    }

    frames.push({
      img,
      x: currentX,
      y: currentY,
      width: img.width,
      height: img.height,
      rotated: false
    })

    rowHeight = Math.max(rowHeight, img.height)
    totalWidth = Math.max(totalWidth, currentX + img.width)
    totalHeight = Math.max(totalHeight, currentY + img.height)

    currentX += img.width + padding
  }

  if (options.powerOfTwo) {
    totalWidth = nextPowerOfTwo(totalWidth)
    totalHeight = nextPowerOfTwo(totalHeight)
  }

  return {
    width: totalWidth,
    height: totalHeight,
    frames
  }
}

/**
 * MaxRects 算法打包（支持多 bin，自动扩容）
 */
export function maxRectsPack(
  images: ImageInfo[],
  options: SpritePackerOptions = {}
): PackedLayout {
  const padding = options.padding ?? 0
  const maxWidthLimit = options.maxWidth ?? 4096
  const maxHeightLimit = options.maxHeight ?? 4096
  const requirePOT = Boolean(options.powerOfTwo)
  const enforceSquare = options.square ?? false

  const maxRectsOptions = {
    smart: options.smart ?? true,
    pot: requirePOT,
    square: enforceSquare,
    allowRotation: options.allowRotation ?? false,
    tag: options.tag ?? false,
    exclusiveTag: options.exclusiveTag ?? true,
    border: options.border ?? 0,
    logic: (options.logic === 'max-area' ? PACKING_LOGIC.MAX_AREA : PACKING_LOGIC.MAX_EDGE)
  }

  const totalArea = images.reduce((sum, img) => sum + img.width * img.height, 0)
  const initialSide = Math.max(64, Math.ceil(Math.sqrt(totalArea)))
  let currentWidth = Math.min(maxWidthLimit, initialSide)
  let currentHeight = enforceSquare ? Math.min(maxHeightLimit, currentWidth) : Math.min(maxHeightLimit, initialSide)

  const sortedImages = [...images].sort((a, b) => b.width * b.height - a.width * a.height)

  while (currentWidth <= maxWidthLimit && currentHeight <= maxHeightLimit) {
    const packer = new MaxRectsPacker(
      currentWidth,
      currentHeight,
      padding,
      maxRectsOptions
    )

    for (const img of sortedImages) {
      packer.add(img.width, img.height, img)
    }

    const allPlaced = packer.bins.length === 1 && packer.bins[0].rects.length === images.length
    if (allPlaced) {
      const bin = packer.bins[0]
      const frames: PackedFrame[] = bin.rects.map((rect: any) => ({
        img: rect.data as ImageInfo,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        rotated: Boolean(rect.rot)
      }))

      let totalWidth = frames.reduce((max, frame) => Math.max(max, frame.x + frame.width), 0)
      let totalHeight = frames.reduce((max, frame) => Math.max(max, frame.y + frame.height), 0)

      if (enforceSquare) {
        const maxSide = Math.max(totalWidth, totalHeight)
        totalWidth = maxSide
        totalHeight = maxSide
      }

      if (requirePOT) {
        totalWidth = nextPowerOfTwo(totalWidth)
        totalHeight = nextPowerOfTwo(totalHeight)
      }

      totalWidth = Math.min(Math.max(totalWidth, 1), maxWidthLimit)
      totalHeight = Math.min(Math.max(totalHeight, 1), maxHeightLimit)

      if (enforceSquare) {
        const finalSide = Math.min(totalWidth, totalHeight)
        totalWidth = finalSide
        totalHeight = finalSide
      }

      return {
        width: totalWidth,
        height: totalHeight,
        frames
      }
    }

    if (enforceSquare) {
      const nextBase = Math.max(currentWidth, currentHeight) * 2
      const target = requirePOT ? nextPowerOfTwo(nextBase) : nextBase
      currentWidth = Math.min(target, maxWidthLimit)
      currentHeight = Math.min(target, maxHeightLimit)
      if (currentWidth === maxWidthLimit && currentHeight === maxHeightLimit) {
        break
      }
    } else {
      if (currentWidth < maxWidthLimit) {
        currentWidth = Math.min(
          maxWidthLimit,
          requirePOT ? nextPowerOfTwo(currentWidth * 2) : currentWidth * 2
        )
      } else if (currentHeight < maxHeightLimit) {
        currentHeight = Math.min(
          maxHeightLimit,
          requirePOT ? nextPowerOfTwo(currentHeight * 2) : currentHeight * 2
        )
      } else {
        break
      }
    }
  }

  throw new Error('图片超出最大尺寸限制，请增大最大宽高或关闭 2 的幂次方限制')
}

