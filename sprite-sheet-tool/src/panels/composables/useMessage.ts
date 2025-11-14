/**
 * Message Composable
 * 
 * 用于在 Cocos Creator 扩展面板中正确显示消息
 */

import { inject } from 'vue'
import { ElMessage } from 'element-plus'
import { keyMessage } from '../provide-inject'
import type { MessageOptions, MessageHandler } from 'element-plus'

/**
 * 使用消息提示
 */
export function useMessage() {
  // 尝试获取注入的 message 函数
  const injectedMessage = inject(keyMessage, null)

  /**
   * 显示消息
   */
  const message = (options?: MessageOptions | string): MessageHandler => {
    // 统一转换为 MessageOptions
    const opts: MessageOptions = typeof options === 'string' ? { message: options } : (options || {})
    
    if (injectedMessage) {
      // 使用注入的 message 函数（已设置 appendTo）
      return injectedMessage(opts)
    } else {
      // 回退到直接使用 ElMessage，但设置 appendTo 为当前面板
      // 尝试找到面板容器
      const panelRoot = document.getElementById('app') || document.body
      opts.appendTo = panelRoot
      return ElMessage(opts)
    }
  }

  /**
   * 显示成功消息
   */
  const success = (msg: string) => {
    return message({ type: 'success', message: msg })
  }

  /**
   * 显示错误消息
   */
  const error = (msg: string) => {
    return message({ type: 'error', message: msg })
  }

  /**
   * 显示警告消息
   */
  const warning = (msg: string) => {
    return message({ type: 'warning', message: msg })
  }

  /**
   * 显示信息消息
   */
  const info = (msg: string) => {
    return message({ type: 'info', message: msg })
  }

  return {
    message,
    success,
    error,
    warning,
    info
  }
}

