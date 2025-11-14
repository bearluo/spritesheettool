<template>
  <div class="unpack-panel">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="upload-card">
          <template #header>
            <span>上传合图和配置</span>
          </template>
          <div class="upload-section">
            <el-upload
              :auto-upload="false"
              :on-change="handleSpriteImageChange"
              :show-file-list="false"
              accept="image/*"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                上传合图文件
              </div>
            </el-upload>
            <div v-if="spriteImageUrl" class="preview-image">
              <img :src="spriteImageUrl" alt="合图" />
            </div>
          </div>
          <div class="upload-section">
            <el-upload
              :auto-upload="false"
              :on-change="handleConfigChange"
              :show-file-list="false"
              accept=".json,.plist"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                上传配置文件 (JSON/PLIST)
              </div>
            </el-upload>
            <div v-if="config" class="config-info">
              <p>配置已加载</p>
              <p>子图数量: {{ config.frames.length }}</p>
              <p>合图尺寸: {{ config.size.w }} × {{ config.size.h }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>拆分结果</span>
              <div class="header-actions">
                <el-button
                  v-if="config && spriteImageUrl"
                  type="primary"
                  @click="handleUnpack"
                  :loading="unpacking"
                >
                  开始拆分
                </el-button>
                <el-button
                  v-if="unpackedBlobs.length > 0"
                  type="success"
                  @click="handleSaveToProject"
                  :loading="saving"
                >
                  保存到项目
                </el-button>
              </div>
            </div>
          </template>
          <div v-if="unpackedBlobs.length === 0" class="empty-state">
            <el-empty description="请上传合图和配置文件" />
          </div>
          <div v-else class="unpacked-list">
            <div
              v-for="(blob, index) in unpackedBlobs"
              :key="index"
              class="unpacked-item"
            >
              <img :src="getBlobUrl(blob)" :alt="config?.frames[index]?.name" />
              <div class="item-info">
                {{ config?.frames[index]?.name }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from '../composables/useMessage'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import type { SpriteSheetConfig } from '../../core'
import { unpackSprites, FileOperations, CocosApi, JsonParser, PlistParser, ErrorHandler, Logger } from '../../core'

const { success, error, warning } = useMessage()
const spriteImageUrl = ref<string>('')
const spriteImageFile = ref<File | null>(null)
const config = ref<SpriteSheetConfig | null>(null)
const unpackedBlobs = ref<Blob[]>([])
const unpacking = ref(false)
const saving = ref(false)

const jsonParser = new JsonParser()
const plistParser = new PlistParser()

const handleSpriteImageChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    spriteImageFile.value = uploadFile.raw as File
    spriteImageUrl.value = URL.createObjectURL(uploadFile.raw as File)
  }
}

const handleConfigChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return

  try {
    const file = uploadFile.raw as File
    Logger.info('加载配置文件:', file.name)
    const text = await file.text()
    
    // 根据文件扩展名选择解析器
    const parser = file.name.endsWith('.plist') ? plistParser : jsonParser
    config.value = parser.parse(text)
    
    Logger.info('配置文件加载成功', `子图数量: ${config.value.frames.length}`)
    success('配置文件加载成功')
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('配置文件加载失败', err)
    error(errorMessage)
  }
}

const handleUnpack = async () => {
  if (!spriteImageUrl.value || !config.value) {
    warning('请先上传合图和配置文件')
    return
  }

  try {
    unpacking.value = true
    Logger.info('开始拆分合图', `子图数量: ${config.value.frames.length}`)
    const results = await unpackSprites(spriteImageUrl.value, config.value)
    unpackedBlobs.value = results.map(r => r.blob)
    Logger.info('拆分成功', `子图数量: ${results.length}`)
    success(`拆分成功，共 ${results.length} 个子图`)
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('拆分失败', err)
    error(errorMessage)
  } finally {
    unpacking.value = false
  }
}

const handleSaveToProject = async () => {
  if (unpackedBlobs.value.length === 0 || !config.value) {
    warning('请先拆分合图')
    return
  }

  try {
    saving.value = true
    Logger.info('开始保存子图到项目', `子图数量: ${unpackedBlobs.value.length}`)
    
    // 保存到项目
    const outputPath = 'assets/sprites'
    
    // 确保目录存在
    await FileOperations.ensureDirectory(outputPath)
    
    // 保存所有子图
    for (let i = 0; i < unpackedBlobs.value.length; i++) {
      const frame = config.value.frames[i]
      const blob = unpackedBlobs.value[i]
      const imagePath = `${outputPath}/${frame.name}`
      Logger.debug(`保存子图 ${i + 1}/${unpackedBlobs.value.length}:`, frame.name)
      await FileOperations.writeImageFromBlob(imagePath, blob)
    }
    
    // 刷新资源数据库
    for (let i = 0; i < unpackedBlobs.value.length; i++) {
      const frame = config.value.frames[i]
      const imagePath = `${outputPath}/${frame.name}`
      await CocosApi.refreshAssetDatabase(imagePath)
    }
    Logger.info('资源数据库已刷新')
    
    success(`已保存 ${unpackedBlobs.value.length} 个子图到项目`)
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('保存子图失败', err)
    error(errorMessage)
  } finally {
    saving.value = false
  }
}

const getBlobUrl = (blob: Blob) => {
  return URL.createObjectURL(blob)
}
</script>

<style scoped>
.unpack-panel {
  padding: calc(var(--size-base, 4) * 5px);
  min-height: 100%;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.upload-card,
.result-card {
  height: 100%;
}

.upload-section {
  margin-bottom: 20px;
}

.preview-image {
  margin-top: 16px;
  text-align: center;
}

.preview-image img {
  max-width: 100%;
  max-height: 200px;
}

.config-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.config-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
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

.empty-state {
  padding: 40px 0;
}

.unpacked-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.unpacked-item {
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.unpacked-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.unpacked-item img {
  width: 100%;
  height: 120px;
  object-fit: contain;
  background: #f5f7fa;
}

.item-info {
  padding: 8px;
  background: #fff;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

