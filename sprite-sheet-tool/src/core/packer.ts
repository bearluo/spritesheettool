import type { ImageInfo } from '../types/image'
import type { SpritePackerOptions, SpritePackerResult, SpriteFrame } from '../types/sprite'
import { createImageElement } from './imageUtils'
import { simplePack, maxRectsPack } from './algorithms'

/**
 * 合图打包逻辑
 */

import { ErrorHandler, ErrorType } from './errorHandler'
import { Logger } from './logger'

export async function packSprites(
  images: ImageInfo[],
  options: SpritePackerOptions = {}
): Promise<SpritePackerResult> {
  return Logger.logExecution(async () => {
    Logger.info('开始打包合图', `图片数量: ${images.length}`, `算法: ${options.algorithm || 'bin-packing'}`)
    
    if (images.length === 0) {
      throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '没有可用的图片')
    }

    const algorithm = options.algorithm ?? 'bin-packing'
    Logger.debug('使用打包算法:', algorithm)
    
    const layout =
      algorithm === 'bin-packing'
        ? maxRectsPack(images, options)
        : simplePack(images, options)

    if (!layout.width || !layout.height) {
      throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '生成的合图尺寸无效')
    }

    Logger.debug('打包布局生成成功', `尺寸: ${layout.width} × ${layout.height}`, `子图数量: ${layout.frames.length}`)

    const canvas = document.createElement('canvas')
    canvas.width = layout.width
    canvas.height = layout.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '无法创建 Canvas 上下文')
    }

    Logger.debug('开始绘制合图', `尺寸: ${layout.width} × ${layout.height}`)
    const frames: SpriteFrame[] = []
    for (let i = 0; i < layout.frames.length; i++) {
      const frame = layout.frames[i]
      const img = frame.img

      if (!img.dataUrl) {
        throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, `图片 ${img.name} 数据缺失`)
      }

      Logger.debug(`绘制子图 ${i + 1}/${layout.frames.length}:`, img.name, `位置: (${frame.x}, ${frame.y})`)

      const imageElement = await createImageElement(img.dataUrl)
      if (frame.rotated) {
        ctx.save()
        ctx.translate(frame.x + frame.width, frame.y)
        ctx.rotate(Math.PI / 2)
        ctx.drawImage(imageElement, 0, 0, img.width, img.height)
        ctx.restore()
      } else {
        ctx.drawImage(imageElement, frame.x, frame.y, img.width, img.height)
      }

      frames.push({
        id: img.id,
        name: img.name,
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        rotated: frame.rotated
      })
    }

    const config = {
      image: 'sprite.png',
      format: 'RGBA8888',
      size: {
        w: layout.width,
        h: layout.height
      },
      scale: 1,
      frames,
      meta: {
        app: 'SpriteSheetTool',
        version: '1.0.0',
        format: 'RGBA8888',
        size: {
          w: layout.width,
          h: layout.height
        }
      }
    }

    Logger.info('合图打包成功', `尺寸: ${layout.width} × ${layout.height}`, `子图数量: ${frames.length}`)
    return {
      canvas,
      config,
      width: layout.width,
      height: layout.height
    }
  }, `打包合图: ${images.length} 张图片`).catch(error => {
    Logger.error('合图打包失败', error)
    ErrorHandler.handleError(error, 'packSprites')
    throw ErrorHandler.createError(
      ErrorType.IMAGE_PROCESS_ERROR,
      ErrorHandler.getErrorMessage(error),
      error
    )
  })
}

