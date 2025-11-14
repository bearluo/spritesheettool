import { name } from '../../package.json' with { type: 'json' };
import * as fs from 'fs';
import * as path from 'path';

// 在打包后的 CommonJS 环境中，Creator 期望的是 module.exports
// 这里声明 module 以便在 TypeScript 中使用
// 注意：在浏览器进程中 module 可能不存在，所以需要运行时判断
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const module: NodeJS.Module | undefined;

// 简单的日志函数（在主进程中使用）
const log = (level: string, message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, ...args);
};

export const methods = {
    async open() {
        log('DEBUG', 'open', this);
        Editor.Panel.open(name);
    },
    getVersion() {
        return Editor.App.version;
    },
    
    /**
     * 读取文件
     */
    async readFile(options: { path: string }): Promise<{ data: string }> {
        try {
            log('DEBUG', '读取文件', options.path);
            const projectPath = Editor.Project.path;
            if (!projectPath) {
                throw new Error('无法获取项目路径');
            }
            const fullPath = path.join(projectPath, options.path);
            
            if (!fs.existsSync(fullPath)) {
                log('ERROR', '文件不存在', options.path);
                throw new Error(`文件不存在: ${options.path}`);
            }
            
            const buffer = fs.readFileSync(fullPath);
            const base64 = buffer.toString('base64');
            
            log('DEBUG', '读取文件成功', options.path, `大小: ${buffer.length} bytes`);
            return { data: base64 };
        } catch (error) {
            log('ERROR', '读取文件失败', error, options.path);
            throw new Error(`读取文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    },
    
    /**
     * 写入文件
     */
    async writeFile(options: { path: string; data: string }): Promise<void> {
        try {
            log('DEBUG', '写入文件', options.path);
            const projectPath = Editor.Project.path;
            if (!projectPath) {
                throw new Error('无法获取项目路径');
            }
            const fullPath = path.join(projectPath, options.path);
            
            // 确保目录存在
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                log('DEBUG', '创建目录', dir);
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // 将 base64 字符串转换为 Buffer
            const buffer = Buffer.from(options.data, 'base64');
            fs.writeFileSync(fullPath, buffer);
            log('DEBUG', '写入文件成功', options.path, `大小: ${buffer.length} bytes`);
        } catch (error) {
            log('ERROR', '写入文件失败', error, options.path);
            throw new Error(`写入文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    },
    
    /**
     * 检查文件是否存在
     */
    async fileExists(options: { path: string }): Promise<{ exists: boolean }> {
        try {
            const projectPath = Editor.Project.path;
            if (!projectPath) {
                throw new Error('无法获取项目路径');
            }
            const fullPath = path.join(projectPath, options.path);
            return { exists: fs.existsSync(fullPath) };
        } catch (error) {
            console.error('检查文件是否存在失败:', error);
            return { exists: false };
        }
    },
    
    /**
     * 列出目录下的文件
     */
    async listDirectory(options: { path: string }): Promise<{ files: string[] }> {
        try {
            log('DEBUG', '列出目录', options.path);
            const projectPath = Editor.Project.path;
            if (!projectPath) {
                throw new Error('无法获取项目路径');
            }
            const fullPath = path.join(projectPath, options.path);
            
            if (!fs.existsSync(fullPath)) {
                log('WARN', '目录不存在', options.path);
                return { files: [] };
            }
            
            const files = fs.readdirSync(fullPath);
            const result = files
                .filter(file => {
                    const filePath = path.join(fullPath, file);
                    const stat = fs.statSync(filePath);
                    return stat.isFile() && !file.endsWith('.meta');
                })
                .map(file => path.join(options.path, file).replace(/\\/g, '/'));
            
            log('DEBUG', '列出目录成功', options.path, `文件数量: ${result.length}`);
            return { files: result };
        } catch (error) {
            log('ERROR', '列出目录失败', error, options.path);
            throw new Error(`列出目录失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    },
    
    /**
     * 确保目录存在
     */
    async ensureDirectory(options: { path: string }): Promise<void> {
        try {
            log('DEBUG', '确保目录存在', options.path);
            const projectPath = Editor.Project.path;
            if (!projectPath) {
                throw new Error('无法获取项目路径');
            }
            const fullPath = path.join(projectPath, options.path);
            
            if (!fs.existsSync(fullPath)) {
                log('DEBUG', '创建目录', options.path);
                fs.mkdirSync(fullPath, { recursive: true });
            } else {
                log('DEBUG', '目录已存在', options.path);
            }
        } catch (error) {
            log('ERROR', '创建目录失败', error, options.path);
            throw new Error(`创建目录失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    },
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}

const extensionEntry = {
    load,
    unload,
    methods
} as const;

export default extensionEntry;

if (typeof module !== 'undefined' && module && module.exports) {
    module.exports = extensionEntry;
}
