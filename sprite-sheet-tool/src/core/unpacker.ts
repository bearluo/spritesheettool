import type { SpriteSheetConfig, SpriteFrame } from '../types/sprite'
import { createImageElement, compressImage } from './imageUtils'

/**
 * 从合图中提取单个子图
 */

import { ErrorHandler, ErrorType } from './errorHandler'
import { Logger } from './logger'

export async function extractFrame(
  spriteImage: HTMLImageElement,
  frame: SpriteFrame
): Promise<Blob> {
  return Logger.logExecution(async () => {
    Logger.debug('提取子图:', frame.name, `位置: (${frame.x}, ${frame.y})`, `尺寸: ${frame.width} × ${frame.height}`)
    
    // 如果图片被旋转，使用源尺寸
    const sourceWidth = frame.rotated ? frame.height : frame.width
    const sourceHeight = frame.rotated ? frame.width : frame.height
    
    const canvas = document.createElement('canvas')
    canvas.width = frame.sourceSize?.w || frame.width
    canvas.height = frame.sourceSize?.h || frame.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '无法创建 Canvas 上下文')
    }

    // 如果有裁剪信息，需要处理偏移
    const offsetX = frame.spriteSourceSize?.x || 0
    const offsetY = frame.spriteSourceSize?.y || 0

    if (frame.rotated) {
      // 处理旋转的图片
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-Math.PI / 2) // 逆时针旋转 90 度
      ctx.drawImage(
        spriteImage,
        frame.x,
        frame.y,
        sourceWidth,
        sourceHeight,
        -sourceHeight / 2,
        -sourceWidth / 2,
        sourceHeight,
        sourceWidth
      )
      ctx.restore()
    } else {
      // 绘制子图
      ctx.drawImage(
        spriteImage,
        frame.x,
        frame.y,
        sourceWidth,
        sourceHeight,
        offsetX,
        offsetY,
        sourceWidth,
        sourceHeight
      )
    }

    // 转换为 Blob
    const blob = await compressImage(canvas, { format: 'png' })
    Logger.debug('提取子图成功:', frame.name, `大小: ${blob.size} bytes`)
    return blob
  }, `提取子图: ${frame.name}`).catch(error => {
    Logger.error('提取子图失败', error, frame.name)
    ErrorHandler.handleError(error, 'extractFrame')
    throw ErrorHandler.createError(
      ErrorType.IMAGE_PROCESS_ERROR,
      ErrorHandler.getErrorMessage(error),
      error
    )
  })
}

/**
 * 拆分合图
 */
export async function unpackSprites(
  spriteImageUrl: string,
  config: SpriteSheetConfig
): Promise<Array<{ name: string; blob: Blob }>> {
  return Logger.logExecution(async () => {
    Logger.info('开始拆分合图', `子图数量: ${config.frames.length}`)
    
    // 加载合图
    const spriteImage = await createImageElement(spriteImageUrl)
    Logger.debug('合图加载成功', `尺寸: ${spriteImage.width} × ${spriteImage.height}`)

    // 提取所有子图
    const results = await Promise.all(
      config.frames.map(async (frame, index) => {
        Logger.debug(`提取子图 ${index + 1}/${config.frames.length}:`, frame.name)
        const blob = await extractFrame(spriteImage, frame)
        return {
          name: frame.name,
          blob
        }
      })
    )

    Logger.info('合图拆分成功', `子图数量: ${results.length}`)
    return results
  }, `拆分合图: ${config.frames.length} 个子图`).catch(error => {
    Logger.error('合图拆分失败', error)
    ErrorHandler.handleError(error, 'unpackSprites')
    throw ErrorHandler.createError(
      ErrorType.IMAGE_PROCESS_ERROR,
      ErrorHandler.getErrorMessage(error),
      error
    )
  })
}

