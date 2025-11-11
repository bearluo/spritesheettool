import { ref } from 'vue'
import type { ImageInfo } from '@/types/image'
import { getImageInfo, createImageElement } from '@/utils/imageUtils'

/**
 * 图片处理组合式函数
 */
export function useImageProcessor() {
  const images = ref<ImageInfo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 添加图片
   */
  async function addImages(files: File[]) {
    loading.value = true
    error.value = null

    try {
      const imageFiles = Array.from(files)
      const newImages = await Promise.all(
        imageFiles.map(file => getImageInfo(file))
      )
      images.value.push(...newImages)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '图片加载失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 移除图片
   */
  function removeImage(id: string) {
    const index = images.value.findIndex(img => img.id === id)
    if (index > -1) {
      const image = images.value[index]
      URL.revokeObjectURL(image.url)
      images.value.splice(index, 1)
    }
  }

  /**
   * 清空所有图片
   */
  function clearImages() {
    images.value.forEach(img => URL.revokeObjectURL(img.url))
    images.value = []
  }

  /**
   * 更新图片信息
   */
  function updateImage(id: string, updates: Partial<ImageInfo>) {
    const index = images.value.findIndex(img => img.id === id)
    if (index > -1) {
      images.value[index] = { ...images.value[index], ...updates }
    }
  }

  async function canvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) {
          resolve(b)
        } else {
          reject(new Error('子图生成失败'))
        }
      }, 'image/png')
    })
    return new File([blob], filename, { type: 'image/png' })
  }

  /**
   * 将图片按行列切割为多个子图
   */
  async function splitImage(
    id: string,
    rows: number,
    columns: number,
    options: { replaceOriginal?: boolean } = {}
  ) {
    const target = images.value.find(img => img.id === id)
    if (!target) {
      throw new Error('未找到指定图片')
    }

    if (rows <= 0 || columns <= 0) {
      throw new Error('行数和列数必须大于 0')
    }

    const dataSrc = target.dataUrl || target.url
    const imgElement = await createImageElement(dataSrc)

    const baseWidth = Math.floor(imgElement.width / columns)
    const baseHeight = Math.floor(imgElement.height / rows)

    if (baseWidth <= 0 || baseHeight <= 0) {
      throw new Error('切割尺寸无效，请减少行列数重试')
    }

    const totalFrames = rows * columns
    const padding = String(totalFrames).length
    const padNumber = (value: number) => String(value).padStart(padding, '0')
    const baseName = target.name.replace(/\.[^/.]+$/, '')
    const newImages: ImageInfo[] = []

    for (let row = 0; row < rows; row++) {
      const sourceHeight = row === rows - 1
        ? imgElement.height - baseHeight * row
        : baseHeight

      for (let col = 0; col < columns; col++) {
        const sourceWidth = col === columns - 1
          ? imgElement.width - baseWidth * col
          : baseWidth

        if (sourceWidth <= 0 || sourceHeight <= 0) continue

        const canvas = document.createElement('canvas')
        canvas.width = sourceWidth
        canvas.height = sourceHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          continue
        }

        const sx = col * baseWidth
        const sy = row * baseHeight
        ctx.drawImage(
          imgElement,
          sx,
          sy,
          sourceWidth,
          sourceHeight,
          0,
          0,
          sourceWidth,
          sourceHeight
        )

        const index = row * columns + col + 1
        const file = await canvasToFile(canvas, `${baseName}_${padNumber(index)}.png`)
        const info = await getImageInfo(file)
        newImages.push(info)
      }
    }

    if (newImages.length === 0) {
      throw new Error('未生成任何子图，请调整行列数重试')
    }

    if (options.replaceOriginal) {
      removeImage(id)
    }

    images.value.push(...newImages)

    return newImages
  }

  return {
    images,
    loading,
    error,
    addImages,
    removeImage,
    clearImages,
    updateImage,
    splitImage
  }
}

