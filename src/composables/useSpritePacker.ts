import { ref } from 'vue'
import type { ImageInfo } from '@/types/image'
import type { SpritePackerOptions, SpritePackerResult, SpriteFrame } from '@/types/sprite'
import { createImageElement } from '@/utils/imageUtils'
import { simplePack, maxRectsPack } from '@/utils/packAlgorithms'

/**
 * 合图打包组合式函数
 */
export function useSpritePacker() {
  const packing = ref(false)
  const error = ref<string | null>(null)

  async function packSprites(
    images: ImageInfo[],
    options: SpritePackerOptions = {}
  ): Promise<SpritePackerResult> {
    packing.value = true
    error.value = null

    try {
      if (images.length === 0) {
        throw new Error('没有可用的图片')
      }

      const algorithm = options.algorithm ?? 'bin-packing'
      const layout =
        algorithm === 'bin-packing'
          ? maxRectsPack(images, options)
          : simplePack(images, options)

      if (!layout.width || !layout.height) {
        throw new Error('生成的合图尺寸无效')
      }

      const canvas = document.createElement('canvas')
      canvas.width = layout.width
      canvas.height = layout.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文')
      }

      const frames: SpriteFrame[] = []
      for (const frame of layout.frames) {
        const img = frame.img

        if (!img.dataUrl) {
          throw new Error(`图片 ${img.name} 数据缺失`)
        }

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

      return {
        canvas,
        config,
        width: layout.width,
        height: layout.height
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '合图生成失败'
      throw err
    } finally {
      packing.value = false
    }
  }

  return {
    packing,
    error,
    packSprites
  }
}

