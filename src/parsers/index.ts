/**
 * 解析器模块统一导出
 */
export type { IParser } from './IParser'
export { JsonParser } from './JsonParser'
export { PlistParser } from './PlistParser'
export { parserRegistry } from './ParserRegistry'
export * from './parserUtils'

