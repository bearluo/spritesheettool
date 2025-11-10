<template>
  <div class="unpack-view">
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
                @click="handleDownloadAll"
              >
                批量下载
              </el-button>
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
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import type { SpriteSheetConfig } from '@/types/sprite'
import { useSpriteUnpacker } from '@/composables/useSpriteUnpacker'
import { readFileAsDataURL, readFileAsText } from '@/utils/fileUtils'
import { parseConfig } from '@/utils/configParser'

const { unpacking, unpackSprites, downloadUnpackedSprites: downloadSprites } = useSpriteUnpacker()

const spriteImageUrl = ref<string | null>(null)
const config = ref<SpriteSheetConfig | null>(null)
const unpackedBlobs = ref<Blob[]>([])

const handleSpriteImageChange = async (file: UploadFile) => {
  if (file.raw) {
    try {
      const url = await readFileAsDataURL(file.raw)
      spriteImageUrl.value = url
      unpackedBlobs.value = []
    } catch (err) {
      ElMessage.error('图片加载失败')
    }
  }
}

const handleConfigChange = async (file: UploadFile) => {
  if (file.raw) {
    try {
      const text = await readFileAsText(file.raw)
      const parsedConfig = parseConfig(text, file.raw.name)
      config.value = parsedConfig
      unpackedBlobs.value = []
      ElMessage.success('配置加载成功')
    } catch (err) {
      ElMessage.error(err instanceof Error ? err.message : '配置加载失败')
    }
  }
}

const handleUnpack = async () => {
  if (!spriteImageUrl.value || !config.value) {
    ElMessage.warning('请先上传合图和配置文件')
    return
  }

  try {
    const blobs = await unpackSprites(spriteImageUrl.value, config.value)
    unpackedBlobs.value = blobs
    ElMessage.success(`成功拆分 ${blobs.length} 张图片`)
  } catch (err) {
    ElMessage.error('拆分失败')
  }
}

const handleDownloadAll = async () => {
  if (!spriteImageUrl.value || !config.value) {
    return
  }

  try {
    await downloadSprites(spriteImageUrl.value, config.value)
    ElMessage.success('下载成功')
  } catch (err) {
    ElMessage.error('下载失败')
  }
}

const getBlobUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}
</script>

<style scoped>
.unpack-view {
  width: 100%;
}

.upload-card,
.result-card {
  min-height: 600px;
}

.upload-section {
  margin-bottom: 20px;
}

.preview-image {
  margin-top: 20px;
  max-height: 200px;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #f5f7fa;
}

.preview-image img {
  max-width: 100%;
  height: auto;
}

.config-info {
  margin-top: 20px;
  padding: 12px;
  background: #f0f9ff;
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
  gap: 8px;
}

.empty-state {
  padding: 40px 0;
}

.unpacked-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.unpacked-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.unpacked-item img {
  width: 100%;
  height: 100px;
  object-fit: contain;
  background: #f5f7fa;
}

.item-info {
  padding: 8px;
  font-size: 12px;
  color: #606266;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

