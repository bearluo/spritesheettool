<template>
  <div class="pack-panel">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header">
              <span>图片上传</span>
              <el-button
                v-if="images.length > 0"
                type="danger"
                size="small"
                @click="handleClear"
              >
                清空
              </el-button>
            </div>
          </template>
          <ImageUploader :multiple="true" @change="handleImagesChange" />
          <ImageList
            v-if="images.length > 0"
            :images="images"
            @remove="handleRemove"
            class="image-list"
          />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <span>合图预览</span>
              <div class="header-actions" v-if="spriteResult">
                <el-button
                  type="primary"
                  :loading="exporting"
                  @click="handlePack"
                >
                  生成合图
                </el-button>
                <el-button
                  type="success"
                  :loading="exporting"
                  @click="handleExport"
                  :disabled="!spriteResult"
                >
                  保存到项目
                </el-button>
              </div>
            </div>
          </template>
          <SpritePreview :canvas="spriteResult?.canvas" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="config-card">
          <template #header>
            <span>配置选项</span>
          </template>
          <ConfigEditor
            :options="options"
            :config="spriteResult?.config || null"
            @update:options="handleOptionsUpdate"
          />
          <div class="output-settings">
            <div class="output-title">输出设置</div>
            <el-form label-width="80px" class="output-form" size="small">
              <el-form-item label="文件名">
                <el-input v-model="exportName" placeholder="例如 sprite-sheet" />
              </el-form-item>
              <el-form-item label="配置格式">
                <el-radio-group v-model="exportFormat">
                  <el-radio-button label="json">JSON</el-radio-button>
                  <el-radio-button label="plist">PLIST</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from '../composables/useMessage'
import ImageUploader from '../components/ImageUploader.vue'
import ImageList from '../components/ImageList.vue'
import SpritePreview from '../components/SpritePreview.vue'
import ConfigEditor from '../components/ConfigEditor.vue'
import { useImageProcessor } from '../composables/useImageProcessor'
import { packSprites, FileOperations, CocosApi, ErrorHandler, Logger, JsonParser, PlistParser, type SpritePackerOptions, type SpritePackerResult, type SpriteSheetConfig } from '../../core'

const { images, addImages, removeImage, clearImages } = useImageProcessor()
const { success, error, warning } = useMessage()

const spriteResult = ref<SpritePackerResult | null>(null)
const exporting = ref(false)
const options = ref<SpritePackerOptions>({
  algorithm: 'bin-packing',
  padding: 2,
  maxWidth: 4096,
  maxHeight: 4096,
  powerOfTwo: false,
  allowRotation: false,
  square: false
})
const exportFormat = ref<'json' | 'plist'>('json')
const exportName = ref('sprite-sheet')
const OUTPUT_DIRECTORY = 'assets/sprite-sheets'

const sanitizeFileName = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}

const cloneConfig = (config: SpriteSheetConfig): SpriteSheetConfig => {
  return JSON.parse(JSON.stringify(config)) as SpriteSheetConfig
}

const buildConfigContent = (
  result: SpritePackerResult,
  imageFileName: string,
  format: 'json' | 'plist'
): string => {
  const cloned = cloneConfig(result.config)
  cloned.image = imageFileName
  cloned.size = {
    w: result.width,
    h: result.height
  }
  cloned.meta = {
    app: cloned.meta?.app ?? 'SpriteSheetTool',
    version: cloned.meta?.version ?? '1.0.0',
    format: cloned.meta?.format ?? 'RGBA8888',
    size: {
      w: result.width,
      h: result.height
    }
  }

  const parser = format === 'plist' ? new PlistParser() : new JsonParser()
  return parser.export(cloned)
}

const handleImagesChange = async (files: File[]) => {
  try {
    await addImages(files)
    // 自动生成合图
    if (images.value.length > 0) {
      await handlePack()
    }
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('添加图片失败', err)
    error(errorMessage)
  }
}

const handleRemove = (id: string) => {
  removeImage(id)
  // 重新生成合图
  if (images.value.length > 0) {
    handlePack()
  }
}

const handleClear = () => {
  clearImages()
  spriteResult.value = null
}

const handleOptionsUpdate = (newOptions: SpritePackerOptions) => {
  options.value = newOptions
  // 重新生成合图
  if (images.value.length > 0) {
    handlePack()
  }
}

const handlePack = async () => {
  if (images.value.length === 0) {
    warning('请先上传图片')
    return
  }

  try {
    exporting.value = true
    Logger.info('开始生成合图', `图片数量: ${images.value.length}`)
    const result = await packSprites(images.value, options.value)
    spriteResult.value = result
    Logger.info('合图生成成功', `尺寸: ${result.width} × ${result.height}`)
    success('合图生成成功')
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('合图生成失败', err)
    error(errorMessage)
  } finally {
    exporting.value = false
  }
}

const handleExport = async () => {
  if (!spriteResult.value) {
    warning('请先生成合图')
    return
  }

  try {
    exporting.value = true
    Logger.info('开始保存合图到项目')
    
    const timestamp = Date.now()
    const providedName = sanitizeFileName(exportName.value)
    const baseName = providedName || `sprite-${timestamp}`
    const imageFileName = `${baseName}.png`
    const configExtension = exportFormat.value === 'plist' ? 'plist' : 'json'
    const configFileName = `${baseName}.${configExtension}`
    const outputPath = OUTPUT_DIRECTORY
    
    // 确保目录存在
    await FileOperations.ensureDirectory(outputPath)
    
    // 保存图片
    const imagePath = `${outputPath}/${imageFileName}`
    await FileOperations.writeImage(imagePath, spriteResult.value.canvas)
    Logger.info('图片已保存:', imagePath)
    
    // 保存配置文件
    const configContent = buildConfigContent(spriteResult.value, imageFileName, exportFormat.value)
    const configPath = `${outputPath}/${configFileName}`
    await FileOperations.writeConfig(configPath, configContent)
    Logger.info(`配置文件已保存 (${exportFormat.value.toUpperCase()})`, configPath)
    
    // 刷新资源数据库
    await CocosApi.refreshAssetDatabase(imagePath)
    await CocosApi.refreshAssetDatabase(configPath)
    Logger.info('资源数据库已刷新')
    
    success(`合图已保存为 ${imageFileName} / ${configFileName}`)
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('保存合图失败', err)
    error(errorMessage)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.pack-panel {
  padding: calc(var(--size-base, 4) * 5px);
  min-height: 100%;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.upload-card,
.preview-card,
.config-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.image-list {
  margin-top: 16px;
}

.output-settings {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--color-normal-border, #3a3a3a);
}

.output-title {
  font-size: calc(var(--size-small-font, 11) * 1px);
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-normal-contrast, rgba(255, 255, 255, 0.87));
}

.output-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

