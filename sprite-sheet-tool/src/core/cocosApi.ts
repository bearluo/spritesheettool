/**
 * Cocos Creator API 封装
 * 
 * 用于与 Cocos Creator 编辑器 API 交互
 * 
 * 注意：此文件在浏览器环境中运行，无法直接使用 Node.js 的 fs 模块
 * 需要通过 Editor.Message 与主进程通信来操作文件系统
 */

import { ErrorHandler, ErrorType } from './errorHandler'
import { Logger } from './logger'

/**
 * Cocos Creator API 封装类
 */
export class CocosApi {
  /**
   * 获取项目路径
   */
  static async getProjectPath(): Promise<string> {
    try {
      Logger.debug('获取项目路径')
      const projectPath = Editor.Project.path
      Logger.debug('获取项目路径成功:', projectPath)
      return projectPath || ''
    } catch (error) {
      Logger.error('获取项目路径失败', error)
      ErrorHandler.handleError(error, 'CocosApi.getProjectPath')
      throw ErrorHandler.createError(
        ErrorType.FILE_READ_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    }
  }

  /**
   * 获取资源信息
   */
  static async getAssetInfo(uuid: string): Promise<any> {
    try {
      const result = await Editor.Message.request('asset-db', 'query-asset-info', uuid)
      return result
    } catch (error) {
      console.error('获取资源信息失败:', error)
      throw new Error(`获取资源信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 读取资源文件（通过路径）
   * 注意：在浏览器环境中，需要通过主进程来读取文件
   */
  static async readAssetByPath(assetPath: string): Promise<ArrayBuffer> {
    try {
      Logger.debug('读取资源文件:', assetPath)
      const result = await Editor.Message.request('sprite-sheet-tool', 'read-file', {
        path: assetPath
      })
      
      if (!result || !result.data) {
        throw ErrorHandler.createError(ErrorType.FILE_NOT_FOUND, `文件不存在: ${assetPath}`)
      }
      
      // 将 base64 字符串转换为 ArrayBuffer
      if (typeof result.data === 'string') {
        const binaryString = atob(result.data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        Logger.debug('读取资源文件成功:', assetPath, `大小: ${bytes.length} bytes`)
        return bytes.buffer
      }
      
      Logger.debug('读取资源文件成功:', assetPath)
      return result.data
    } catch (error) {
      Logger.error('读取资源文件失败', error, assetPath)
      ErrorHandler.handleError(error, 'CocosApi.readAssetByPath')
      throw ErrorHandler.createError(
        ErrorType.FILE_READ_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    }
  }

  /**
   * 写入资源文件
   * 注意：在浏览器环境中，需要通过主进程来写入文件
   */
  static async writeAsset(assetPath: string, data: ArrayBuffer): Promise<void> {
    
    // 获取当前扩展对象
    const pkg = Editor.Package.getPackages({ name: 'sprite-sheet-tool' });

    console.log('调用扩展对象：', pkg);
    try {
      Logger.debug('写入资源文件:', assetPath, `大小: ${data.byteLength} bytes`)
      // 将 ArrayBuffer 转换为 base64 字符串
      const bytes = new Uint8Array(data)
      const binaryString = String.fromCharCode(...bytes)
      const base64 = btoa(binaryString)
      
      // 通过 Editor.Message 请求主进程写入文件
      await Editor.Message.send('sprite-sheet-tool', 'write-file', {
        path: assetPath,
        data: base64
      })
      Logger.debug('写入资源文件成功:', assetPath)
    } catch (error) {
      Logger.error('写入资源文件失败', error, assetPath)
      ErrorHandler.handleError(error, 'CocosApi.writeAsset')
      throw ErrorHandler.createError(
        ErrorType.FILE_WRITE_ERROR,
        ErrorHandler.getErrorMessage(error),
        error
      )
    }
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
      // 构建完整路径
      const assetPath = Editor.Utils.Path.join(parentPath, name)
      
      // 写入文件
      await this.writeAsset(assetPath, data)
      
      // 刷新资源数据库
      await this.refreshAssetDatabase(assetPath)
      
      return assetPath
    } catch (error) {
      console.error('创建资源失败:', error)
      throw new Error(`创建资源失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 刷新资源数据库
   */
  static async refreshAssetDatabase(assetPath: string): Promise<void> {
    try {
        Logger.debug('刷新资源数据库:', assetPath)
        const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', assetPath)
        const uuid = assetInfo?.uuid
        if (uuid) {
          await Editor.Message.request('asset-db', 'refresh-asset', uuid)
          Logger.debug('刷新资源数据库成功:', assetPath)
        } else {
          Logger.warn('刷新资源数据库失败: 未获取到 UUID', assetPath)
        }
    } catch (error) {
      Logger.warn('刷新资源数据库失败', error, assetPath)
      // 不抛出错误，因为刷新失败不影响主流程
    }
  }

  /**
   * 获取资源 UUID（通过路径）
   */
  static async getAssetUuid(assetPath: string): Promise<string> {
    try {
      // 通过路径获取 UUID
      // 注意：这个 API 可能需要调整，取决于 Cocos Creator 的版本
      const result = await Editor.Message.request('asset-db', 'query-asset-info', assetPath)
      return result?.uuid || ''
    } catch (error) {
      console.error('获取资源 UUID 失败:', error)
      return ''
    }
  }

  /**
   * 检查资源是否存在
   */
  static async assetExists(assetPath: string): Promise<boolean> {
    try {
      const result = await Editor.Message.request('sprite-sheet-tool', 'file-exists', {
        path: assetPath
      })
      return result?.exists || false
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
      const result = await Editor.Message.request('sprite-sheet-tool', 'list-directory', {
        path: directoryPath
      })
      return result?.files || []
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
      await Editor.Message.send('sprite-sheet-tool', 'ensure-directory', {
        path: directoryPath
      })
    } catch (error) {
      console.error('创建目录失败:', error)
      throw new Error(`创建目录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

