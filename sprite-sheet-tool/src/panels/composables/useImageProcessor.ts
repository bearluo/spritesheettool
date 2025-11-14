/**
 * 图片处理 Composables
 */

import { ref } from 'vue'
import type { ImageInfo } from '../../core'
import { getImageInfo, createImageElement, ErrorHandler, Logger, ErrorType } from '../../core'


export function useImageProcessor() {
  const images = ref<ImageInfo[]>([])
  /**
   * 添加图片
   */
  const addImages = async (files: File[]) => {
    try {
      Logger.info('添加图片', `文件数量: ${files.length}`)
      const imageInfos = await Promise.all(
        files.map(file => getImageInfo(file))
      )
      images.value.push(...imageInfos)
      Logger.info('添加图片成功', `图片数量: ${imageInfos.length}`)
    } catch (error) {
      Logger.error('添加图片失败', error)
      ErrorHandler.handleError(error, 'useImageProcessor.addImages')
      throw ErrorHandler.createError(
        ErrorType.IMAGE_PROCESS_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    }
  }

  /**
   * 移除图片
   */
  const removeImage = (id: string) => {
    const index = images.value.findIndex(img => img.id === id)
    if (index !== -1) {
      const image = images.value[index]
      if (image.url) {
        URL.revokeObjectURL(image.url)
      }
      images.value.splice(index, 1)
    }
  }

  /**
   * 清空图片
   */
  const clearImages = () => {
    images.value.forEach(img => {
      if (img.url) {
        URL.revokeObjectURL(img.url)
      }
    })
    images.value = []
  }

  /**
   * 将 Canvas 转换为 File
   */
  const canvasToFile = async (canvas: HTMLCanvasElement, filename: string): Promise<File> => {
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
  const splitImage = async (
    id: string,
    rows: number,
    columns: number,
    options: { replaceOriginal?: boolean } = {}
  ): Promise<ImageInfo[]> => {
    return Logger.logExecution(async () => {
      Logger.info('开始拆分图片', `ID: ${id}`, `行列: ${rows} × ${columns}`)
      
      const target = images.value.find(img => img.id === id)
      if (!target) {
        throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '未找到指定图片')
      }

      if (rows <= 0 || columns <= 0) {
        throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '行数和列数必须大于 0')
      }

      const dataSrc = target.dataUrl || target.url
      if (!dataSrc) {
        throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '图片数据缺失')
      }

      const imgElement = await createImageElement(dataSrc)
      Logger.debug('图片加载成功', `尺寸: ${imgElement.width} × ${imgElement.height}`)

      const baseWidth = Math.floor(imgElement.width / columns)
      const baseHeight = Math.floor(imgElement.height / rows)

      if (baseWidth <= 0 || baseHeight <= 0) {
        throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '切割尺寸无效，请减少行列数重试')
      }

      Logger.debug('计算切割尺寸', `基础尺寸: ${baseWidth} × ${baseHeight}`)

      const totalFrames = rows * columns
      const padding = String(totalFrames).length
      const padNumber = (value: number) => String(value).padStart(padding, '0')
      const baseName = target.name.replace(/\.[^/.]+$/, '')
      const newImages: ImageInfo[] = []

      Logger.debug('开始切割图片', `总帧数: ${totalFrames}`)
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
          const filename = `${baseName}_${padNumber(index)}.png`
          Logger.debug(`切割子图 ${index}/${totalFrames}:`, filename, `尺寸: ${sourceWidth} × ${sourceHeight}`)
          const file = await canvasToFile(canvas, filename)
          const info = await getImageInfo(file)
          newImages.push(info)
        }
      }

      if (newImages.length === 0) {
        throw ErrorHandler.createError(ErrorType.IMAGE_PROCESS_ERROR, '未生成任何子图，请调整行列数重试')
      }

      if (options.replaceOriginal) {
        Logger.debug('替换原图:', target.name)
        removeImage(id)
      }

      images.value.push(...newImages)
      Logger.info('拆分成功', `子图数量: ${newImages.length}`)
      return newImages
    }, `拆分图片: ${rows} × ${columns}`).catch(error => {
      Logger.error('拆分图片失败', error)
      ErrorHandler.handleError(error, 'useImageProcessor.splitImage')
      throw ErrorHandler.createError(
        ErrorType.IMAGE_PROCESS_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    })
  }

  return {
    images,
    addImages,
    removeImage,
    clearImages,
    splitImage
  }
}

