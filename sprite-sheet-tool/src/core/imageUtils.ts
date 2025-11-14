import type { ImageInfo, ImageLoadResult, ImageProcessOptions } from '../types/image'

/**
 * 加载图片
 */
export function loadImage(file: File): Promise<ImageLoadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const img = new Image()

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          dataUrl
        })
      }
      img.onerror = reject
      img.src = dataUrl
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 获取图片信息
 */
export async function getImageInfo(file: File): Promise<ImageInfo> {
  const { width, height, dataUrl } = await loadImage(file)
  return {
    id: `${Date.now()}-${Math.random()}`,
    file,
    name: file.name,
    width,
    height,
    size: file.size,
    url: URL.createObjectURL(file),
    dataUrl
  }
}

/**
 * 压缩图片
 */
export function compressImage(
  canvas: HTMLCanvasElement,
  options: ImageProcessOptions = {}
): Promise<Blob> {
  const { format = 'png', quality = 0.9 } = options

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('图片压缩失败'))
        }
      },
      `image/${format}`,
      quality
    )
  })
}

/**
 * 下载图片
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 创建图片元素
 */
export function createImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

