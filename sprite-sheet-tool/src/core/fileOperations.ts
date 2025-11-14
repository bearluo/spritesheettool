/**
 * 文件操作封装
 * 
 * 用于处理文件读取、写入等操作
 */

import { CocosApi } from './cocosApi'
import { ErrorHandler, ErrorType } from './errorHandler'
import { Logger } from './logger'

/**
 * 文件操作类
 */
export class FileOperations {
  /**
   * 读取图片文件
   */
  static async readImage(assetPath: string): Promise<ArrayBuffer> {
    return Logger.logExecution(async () => {
      Logger.info('读取图片文件:', assetPath)
      const data = await CocosApi.readAssetByPath(assetPath)
      Logger.info('读取图片文件成功:', assetPath)
      return data
    }, `读取图片文件: ${assetPath}`).catch(error => {
      ErrorHandler.handleError(error, 'FileOperations.readImage')
      throw ErrorHandler.createError(
        ErrorType.FILE_READ_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    })
  }

  /**
   * 读取图片文件为 DataURL
   */
  static async readImageAsDataURL(assetPath: string): Promise<string> {
    try {
      const data = await CocosApi.readAssetByPath(assetPath)
      const bytes = new Uint8Array(data)
      const binaryString = String.fromCharCode(...bytes)
      const base64 = btoa(binaryString)
      return `data:image/png;base64,${base64}`
    } catch (error) {
      console.error('读取图片文件为 DataURL 失败:', error)
      throw new Error(`读取图片文件为 DataURL 失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 写入图片文件
   */
  static async writeImage(assetPath: string, canvas: HTMLCanvasElement): Promise<void> {
    return Logger.logExecution(async () => {
      Logger.info('写入图片文件:', assetPath, `尺寸: ${canvas.width} × ${canvas.height}`)
      // 将 Canvas 转换为 Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas 转换为 Blob 失败'))
          }
        }, 'image/png')
      })

      // 将 Blob 转换为 ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer()

      // 写入文件
      await CocosApi.writeAsset(assetPath, arrayBuffer)
      Logger.info('写入图片文件成功:', assetPath)
    }, `写入图片文件: ${assetPath}`).catch(error => {
      ErrorHandler.handleError(error, 'FileOperations.writeImage')
      throw ErrorHandler.createError(
        ErrorType.FILE_WRITE_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    })
  }

  /**
   * 写入图片文件（通过 Blob）
   */
  static async writeImageFromBlob(assetPath: string, blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer()
      await CocosApi.writeAsset(assetPath, arrayBuffer)
    } catch (error) {
      console.error('写入图片文件失败:', error)
      throw new Error(`写入图片文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 读取配置文件
   */
  static async readConfig(assetPath: string): Promise<string> {
    try {
      const data = await CocosApi.readAssetByPath(assetPath)
      const decoder = new TextDecoder('utf-8')
      return decoder.decode(data)
    } catch (error) {
      console.error('读取配置文件失败:', error)
      throw new Error(`读取配置文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 写入配置文件
   */
  static async writeConfig(assetPath: string, content: string): Promise<void> {
    return Logger.logExecution(async () => {
      Logger.info('写入配置文件:', assetPath, `大小: ${content.length} 字符`)
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      await CocosApi.writeAsset(assetPath, data.buffer)
      Logger.info('写入配置文件成功:', assetPath)
    }, `写入配置文件: ${assetPath}`).catch(error => {
      ErrorHandler.handleError(error, 'FileOperations.writeConfig')
      throw ErrorHandler.createError(
        ErrorType.FILE_WRITE_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    })
  }

  /**
   * 创建资源文件
   */
  static async createAsset(
    parentPath: string,
    name: string,
    data: ArrayBuffer
  ): Promise<string> {
    try {
      const assetPath = await CocosApi.createAsset(parentPath, name, data)
      return assetPath
    } catch (error) {
      console.error('创建资源文件失败:', error)
      throw new Error(`创建资源文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 创建图片资源
   */
  static async createImageAsset(
    parentPath: string,
    name: string,
    canvas: HTMLCanvasElement
  ): Promise<string> {
    try {
      // 将 Canvas 转换为 Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas 转换为 Blob 失败'))
          }
        }, 'image/png')
      })

      // 将 Blob 转换为 ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer()

      // 创建资源
      const assetPath = await CocosApi.createAsset(parentPath, name, arrayBuffer)
      return assetPath
    } catch (error) {
      console.error('创建图片资源失败:', error)
      throw new Error(`创建图片资源失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 创建配置文件
   */
  static async createConfigAsset(
    parentPath: string,
    name: string,
    content: string
  ): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const assetPath = await CocosApi.createAsset(parentPath, name, data.buffer)
      return assetPath
    } catch (error) {
      console.error('创建配置文件失败:', error)
      throw new Error(`创建配置文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 检查资源是否存在
   */
  static async assetExists(assetPath: string): Promise<boolean> {
    try {
      return await CocosApi.assetExists(assetPath)
    } catch (error) {
      console.error('检查资源是否存在失败:', error)
      return false
    }
  }

  /**
   * 获取资源目录下的所有资源
   */
  static async getAssetsInDirectory(directoryPath: string): Promise<string[]> {
    try {
      return await CocosApi.getAssetsInDirectory(directoryPath)
    } catch (error) {
      console.error('获取资源目录失败:', error)
      throw new Error(`获取资源目录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 确保目录存在
   */
  static async ensureDirectory(directoryPath: string): Promise<void> {
    try {
      await CocosApi.ensureDirectory(directoryPath)
    } catch (error) {
      console.error('创建目录失败:', error)
      throw new Error(`创建目录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

