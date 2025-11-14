/**
 * 错误处理模块
 * 
 * 用于统一处理错误，提供友好的错误消息
 */

/**
 * 错误类型
 */
export enum ErrorType {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_CONFIG = 'INVALID_CONFIG',
  IMAGE_PROCESS_ERROR = 'IMAGE_PROCESS_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误信息映射
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.FILE_NOT_FOUND]: '文件不存在',
  [ErrorType.FILE_READ_ERROR]: '文件读取失败',
  [ErrorType.FILE_WRITE_ERROR]: '文件写入失败',
  [ErrorType.INVALID_FORMAT]: '文件格式无效',
  [ErrorType.INVALID_CONFIG]: '配置文件格式错误',
  [ErrorType.IMAGE_PROCESS_ERROR]: '图片处理失败',
  [ErrorType.NETWORK_ERROR]: '网络错误',
  [ErrorType.UNKNOWN_ERROR]: '未知错误'
}

/**
 * 错误处理类
 */
export class ErrorHandler {
  /**
   * 获取错误类型
   */
  static getErrorType(error: unknown): ErrorType {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      if (message.includes('not found') || message.includes('不存在')) {
        return ErrorType.FILE_NOT_FOUND
      }
      if (message.includes('read') || message.includes('读取')) {
        return ErrorType.FILE_READ_ERROR
      }
      if (message.includes('write') || message.includes('写入')) {
        return ErrorType.FILE_WRITE_ERROR
      }
      if (message.includes('format') || message.includes('格式')) {
        return ErrorType.INVALID_FORMAT
      }
      if (message.includes('config') || message.includes('配置')) {
        return ErrorType.INVALID_CONFIG
      }
      if (message.includes('image') || message.includes('图片')) {
        return ErrorType.IMAGE_PROCESS_ERROR
      }
      if (message.includes('network') || message.includes('网络')) {
        return ErrorType.NETWORK_ERROR
      }
    }
    
    return ErrorType.UNKNOWN_ERROR
  }

  /**
   * 获取友好的错误消息
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const errorType = this.getErrorType(error)
      const baseMessage = ERROR_MESSAGES[errorType]
      
      // 如果错误消息包含中文，直接返回
      if (/[\u4e00-\u9fa5]/.test(error.message)) {
        return error.message
      }
      
      // 否则返回基础消息和错误详情
      return `${baseMessage}: ${error.message}`
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    return ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR]
  }

  /**
   * 处理错误
   */
  static handleError(error: unknown, context?: string): void {
    const errorMessage = this.getErrorMessage(error)
    const logMessage = context 
      ? `[${context}] ${errorMessage}`
      : errorMessage
    
    console.error(logMessage, error)
    
    // 可以在这里添加更多的错误处理逻辑
    // 比如发送错误报告到服务器、记录错误日志等
  }

  /**
   * 包装异步函数，自动处理错误
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handleError(error, context)
        throw error
      }
    }) as T
  }

  /**
   * 创建错误对象
   */
  static createError(
    type: ErrorType,
    message: string,
    originalError?: unknown
  ): Error {
    const error = new Error(message)
    ;(error as any).type = type
    ;(error as any).originalError = originalError
    return error
  }

  /**
   * 检查错误类型
   */
  static isErrorType(error: unknown, type: ErrorType): boolean {
    if (error instanceof Error) {
      return (error as any).type === type
    }
    return false
  }
}

