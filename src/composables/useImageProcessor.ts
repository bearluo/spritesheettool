import { ref } from 'vue'
import type { ImageInfo } from '@/types/image'
import { getImageInfo } from '@/utils/imageUtils'

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

  return {
    images,
    loading,
    error,
    addImages,
    removeImage,
    clearImages,
    updateImage
  }
}

