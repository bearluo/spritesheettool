import type { SpriteSheetConfig, SpriteFrame } from '@/types/sprite'
import type { IParser } from './IParser'
import { XMLParser } from 'fast-xml-parser'
import { parsePoint, parseRect, parseSize } from './parserUtils'

function toArray(value: any): any[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function getNodeType(node: any): string {
  if (!node || typeof node !== 'object') return ''
  const keys = Object.keys(node)
  return keys.length > 0 ? keys[0] : ''
}

function getNodeValue(node: any): any {
  const type = getNodeType(node)
  return type ? node[type] : undefined
}

function extractTextValue(value: any): string | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = extractTextValue(item)
      if (text !== null) {
        return text
      }
    }
    return null
  }

  if (typeof value === 'object') {
    if (value['#text'] !== undefined) {
      return String(value['#text'])
    }
    for (const key of Object.keys(value)) {
      const text = extractTextValue(value[key])
      if (text !== null) {
        return text
      }
    }
  }

  return null
}

function parseNodeValue(key: string, type: string, value: any): any {
  switch (type) {
    case 'dict':
      return processDict(value)
    case 'array':
      return processArray(value)
    case 'true':
      return true
    case 'false':
      return false
    case 'integer': {
      const text = extractTextValue(value)
      return text ? parseInt(text, 10) : 0
    }
    case 'real': {
      const text = extractTextValue(value)
      return text ? parseFloat(text) : 0
    }
    case 'string': {
      const text = extractTextValue(value) ?? ''
      if (!text) return ''
      if (key === 'frame' || key === 'sourceColorRect') {
        return parseRect(text)
      }
      if (key === 'sourceSize' || key === 'size') {
        return parseSize(text)
      }
      if (key === 'offset') {
        return parsePoint(text)
      }
      return text
    }
    default: {
      const text = extractTextValue(value)
      if (text !== null) {
        if (text === 'true' || text === 'false') {
          return text === 'true'
        }
        const num = Number(text)
        if (!Number.isNaN(num) && text.trim() !== '') {
          return num
        }
        return text
      }
      return value
    }
  }
}

function processArray(nodes: any): any[] {
  const arr = toArray(nodes)
  const result: any[] = []
  for (const node of arr) {
    if (!node || typeof node !== 'object') {
      continue
    }
    const type = getNodeType(node)
    const value = getNodeValue(node)
    if (!type) continue
    result.push(parseNodeValue('', type, value))
  }
  return result
}

function processDict(nodes: any): Record<string, any> {
  const items = toArray(nodes)
  const result: Record<string, any> = {}
  let currentKey: string | null = null

  for (const node of items) {
    if (!node || typeof node !== 'object') {
      continue
    }
    const type = getNodeType(node)
    const value = getNodeValue(node)
    if (!type) continue

    if (type === 'key') {
      currentKey = extractTextValue(value)
    } else if (currentKey) {
      result[currentKey] = parseNodeValue(currentKey, type, value)
      currentKey = null
    }
  }

  return result
}

function processPlist(root: any): any {
  const nodes = toArray(root)
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const type = getNodeType(node)
    const value = getNodeValue(node)
    if (!type || type === '?xml') continue

    if (type === 'plist') {
      const children = toArray(value)
      for (const child of children) {
        if (!child || typeof child !== 'object') continue
        const childType = getNodeType(child)
        if (childType === 'dict') {
          return processDict(getNodeValue(child))
        }
      }
    } else if (type === 'dict') {
      return processDict(value)
    }
  }
  throw new Error('PLIST 格式错误：未找到 dict 节点')
}

/**
 * PLIST 格式解析器
 */
export class PlistParser implements IParser {
  name = 'PLIST'
  extensions = ['plist']

  parse(content: string): SpriteSheetConfig {
    try {
      const parser = new XMLParser({
        preserveOrder: true,
        ignoreDeclaration: true,
        ignoreAttributes: true,
        attributeNamePrefix: '',
        trimValues: true,
        allowBooleanAttributes: true,
        parseTagValue: true
      })

      const parsed = parser.parse(content)
      const plistData = processPlist(parsed)

      const frames = plistData.frames as Record<string, any>
      const metadata = plistData.metadata as Record<string, any>

      if (!frames || typeof frames !== 'object') {
        throw new Error('PLIST 格式错误：缺少 frames')
      }
      if (!metadata || typeof metadata !== 'object') {
        throw new Error('PLIST 格式错误：缺少 metadata')
      }

      const size = metadata.size || { w: 0, h: 0 }
      const textureFileName = metadata.textureFileName || 'sprite.png'

      const spriteFrames: SpriteFrame[] = []
      for (const [name, frameData] of Object.entries(frames)) {
        if (!frameData || typeof frameData !== 'object') continue

        const frameRect = frameData.frame
        if (!frameRect) continue

        const rotated = frameData.rotated === true
          || frameData.rotated === 'true'
          || frameData.rotated === 1

        const frame = frameRect as { x: number; y: number; w: number; h: number }
        const sourceSize = (frameData.sourceSize || { w: frame.w, h: frame.h }) as { w: number; h: number }
        const sourceColorRect = (frameData.sourceColorRect || frame) as { x: number; y: number; w: number; h: number }

        let frameWidth = frame.w
        let frameHeight = frame.h
        if (rotated) {
          frameWidth = frame.h
          frameHeight = frame.w
        }

        spriteFrames.push({
          id: name,
          name,
          x: frame.x,
          y: frame.y,
          width: frameWidth,
          height: frameHeight,
          rotated,
          trimmed:
            sourceColorRect.x !== 0 ||
            sourceColorRect.y !== 0 ||
            sourceColorRect.w !== sourceSize.w ||
            sourceColorRect.h !== sourceSize.h,
          sourceSize: {
            w: sourceSize.w,
            h: sourceSize.h
          },
          spriteSourceSize: {
            x: sourceColorRect.x,
            y: sourceColorRect.y,
            w: sourceColorRect.w,
            h: sourceColorRect.h
          }
        })
      }

      return {
        image: textureFileName,
        format: 'RGBA8888',
        size: {
          w: size.w ?? 0,
          h: size.h ?? 0
        },
        scale: 1,
        frames: spriteFrames,
        meta: {
          app: 'SpriteSheetTool',
          version: '1.0.0',
          format: 'RGBA8888',
          size: {
            w: size.w ?? 0,
            h: size.h ?? 0
          }
        }
      }
    } catch (error) {
      throw new Error(`PLIST 配置文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  export(config: SpriteSheetConfig): string {
    let plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>frames</key>
\t<dict>
`

    for (const frame of config.frames) {
      const frameName = frame.name
      const frameRect = `{{${frame.x},${frame.y}},{${frame.width},${frame.height}}}`
      const offset = frame.spriteSourceSize ? `{${frame.spriteSourceSize.x},${frame.spriteSourceSize.y}}` : '{0,0}'
      const rotated = frame.rotated ? '<true/>' : '<false/>'
      const sourceSize = frame.sourceSize ? `{${frame.sourceSize.w},${frame.sourceSize.h}}` : `{${frame.width},${frame.height}}`
      const sourceColorRect = frame.spriteSourceSize
        ? `{{${frame.spriteSourceSize.x},${frame.spriteSourceSize.y}},{${frame.spriteSourceSize.w},${frame.spriteSourceSize.h}}}`
        : frameRect

      plist += `\t\t<key>${frameName}</key>
\t\t<dict>
\t\t\t<key>frame</key>
\t\t\t<string>${frameRect}</string>
\t\t\t<key>offset</key>
\t\t\t<string>${offset}</string>
\t\t\t<key>rotated</key>
\t\t\t${rotated}
\t\t\t<key>sourceColorRect</key>
\t\t\t<string>${sourceColorRect}</string>
\t\t\t<key>sourceSize</key>
\t\t\t<string>${sourceSize}</string>
\t\t</dict>
`
    }

    plist += `\t</dict>
\t<key>metadata</key>
\t<dict>
\t\t<key>format</key>
\t\t<integer>2</integer>
\t\t<key>size</key>
\t\t<string>{${config.size.w},${config.size.h}}</string>
\t\t<key>textureFileName</key>
\t\t<string>${config.image}</string>
\t</dict>
</dict>
</plist>`

    return plist
  }

  getMimeType(): string {
    return 'application/xml'
  }
}

