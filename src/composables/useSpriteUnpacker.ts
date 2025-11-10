import { ref } from 'vue'
import type { SpriteSheetConfig, SpriteFrame } from '@/types/sprite'
import { createImageElement, downloadImage, compressImage } from '@/utils/imageUtils'
import JSZip from 'jszip'

/**
 * 拆图组合式函数
 */
export function useSpriteUnpacker() {
  const unpacking = ref(false)
  const error = ref<string | null>(null)

  /**
   * 从合图中提取单个子图
   */
  async function extractFrame(
    spriteImage: HTMLImageElement,
    frame: SpriteFrame
  ): Promise<Blob> {
    // 如果图片被旋转，使用源尺寸
    const sourceWidth = frame.rotated ? frame.height : frame.width
    const sourceHeight = frame.rotated ? frame.width : frame.height
    
    const canvas = document.createElement('canvas')
    canvas.width = frame.sourceSize?.w || frame.width
    canvas.height = frame.sourceSize?.h || frame.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文')
    }

    // 如果有裁剪信息，需要处理偏移
    const offsetX = frame.spriteSourceSize?.x || 0
    const offsetY = frame.spriteSourceSize?.y || 0

    if (frame.rotated) {
      // 处理旋转的图片
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-Math.PI / 2) // 逆时针旋转90度
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
    return await compressImage(canvas, { format: 'png' })
  }

  /**
   * 拆分合图
   */
  async function unpackSprites(
    spriteImageUrl: string,
    config: SpriteSheetConfig
  ): Promise<Blob[]> {
    unpacking.value = true
    error.value = null

    try {
      // 加载合图
      const spriteImage = await createImageElement(spriteImageUrl)

      // 提取所有子图
      const blobs = await Promise.all(
        config.frames.map(frame => extractFrame(spriteImage, frame))
      )

      return blobs
    } catch (err) {
      error.value = err instanceof Error ? err.message : '拆图失败'
      throw err
    } finally {
      unpacking.value = false
    }
  }

  /**
   * 批量下载拆分后的图片
   */
  async function downloadUnpackedSprites(
    spriteImageUrl: string,
    config: SpriteSheetConfig
  ): Promise<void> {
    try {
      const blobs = await unpackSprites(spriteImageUrl, config)

      // 使用 JSZip 打包下载
      const zip = new JSZip()
      config.frames.forEach((frame, index) => {
        const blob = blobs[index]
        zip.file(frame.name, blob)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadImage(zipBlob, 'unpacked-sprites.zip')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '下载失败'
      throw err
    }
  }

  return {
    unpacking,
    error,
    unpackSprites,
    downloadUnpackedSprites
  }
}

