/**
 * 日志模块
 * 
 * 用于统一记录日志，支持不同级别的日志输出
 */

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * 日志配置
 */
interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableEditor: boolean
}

/**
 * 日志类
 */
export class Logger {
  private static config: LoggerConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableEditor: false
  }

  /**
   * 配置日志
   */
  static configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 输出日志
   */
  private static log(
    level: LogLevel,
    message: string,
    ...args: any[]
  ): void {
    if (level < this.config.level) {
      return
    }

    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const logMessage = `[${timestamp}] [${levelName}] ${message}`

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, ...args)
          break
        case LogLevel.INFO:
          console.info(logMessage, ...args)
          break
        case LogLevel.WARN:
          console.warn(logMessage, ...args)
          break
        case LogLevel.ERROR:
          console.error(logMessage, ...args)
          break
      }
    }

    if (this.config.enableEditor && typeof Editor !== 'undefined') {
      try {
        // 在 Cocos Creator 编辑器中输出日志
        // 注意：Editor.log 可能不存在，使用 console 输出
        if (level === LogLevel.ERROR) {
          console.error(logMessage, ...args)
        } else if (level === LogLevel.WARN) {
          console.warn(logMessage, ...args)
        } else {
          console.log(logMessage, ...args)
        }
      } catch (error) {
        // 如果 Editor 不可用，忽略
      }
    }
  }

  /**
   * 调试日志
   */
  static debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  /**
   * 信息日志
   */
  static info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args)
  }

  /**
   * 警告日志
   */
  static warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args)
  }

  /**
   * 错误日志
   */
  static error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args)
  }

  /**
   * 记录函数执行时间
   */
  static time(label: string): void {
    if (this.config.level <= LogLevel.DEBUG) {
      console.time(label)
    }
  }

  /**
   * 结束记录函数执行时间
   */
  static timeEnd(label: string): void {
    if (this.config.level <= LogLevel.DEBUG) {
      console.timeEnd(label)
    }
  }

  /**
   * 记录函数执行
   */
  static async logExecution<T>(
    fn: () => Promise<T>,
    message: string
  ): Promise<T> {
    const startTime = Date.now()
    this.debug(`开始执行: ${message}`)
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      this.debug(`完成执行: ${message} (${duration}ms)`)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      this.error(`执行失败: ${message} (${duration}ms)`, error)
      throw error
    }
  }
}

// 在开发环境中启用调试日志
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  Logger.configure({ level: LogLevel.DEBUG })
}

