<template>
  <div class="pack-view">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header">
              <span>图片上传</span>
              <div class="header-actions">
                <el-button
                  v-if="images.length > 0"
                  type="danger"
                  size="small"
                  @click="handleClear"
                >
                  清空
                </el-button>
              </div>
            </div>
          </template>
          <ImageUploader @change="handleImagesChange" />
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
                <el-input
                  v-model="exportName"
                  size="small"
                  placeholder="导出文件名"
                  class="filename-input"
                />
                <el-dropdown @command="handleExport">
                  <el-button type="primary" :loading="exporting">
                    导出合图
                    <el-icon class="el-icon--right">
                      <ArrowDown />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="json">导出 JSON 配置</el-dropdown-item>
                      <el-dropdown-item command="plist">导出 PLIST 配置</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
            :config="spriteResult?.config"
            @update:options="handleOptionsUpdate"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import ImageUploader from '@/components/ImageUploader.vue'
import ImageList from '@/components/ImageList.vue'
import SpritePreview from '@/components/SpritePreview.vue'
import ConfigEditor from '@/components/ConfigEditor.vue'
import { useImageProcessor } from '@/composables/useImageProcessor'
import { useSpritePacker } from '@/composables/useSpritePacker'
import { useSpriteStore } from '@/stores/spriteStore'
import { downloadImage, compressImage } from '@/utils/imageUtils'
import { downloadConfig } from '@/utils/configParser'
import type { SpritePackerOptions } from '@/types/sprite'
import { ImageInfo } from '@/types/image'

const { images, addImages, removeImage, clearImages } = useImageProcessor()
const { packSprites, error: packError } = useSpritePacker()
const spriteStore = useSpriteStore()

const spriteResult = ref<Awaited<ReturnType<typeof packSprites>> | null>(null)
const exporting = ref(false)
const exportName = ref('sprite')
const options = ref<SpritePackerOptions>({
  padding: 2,
  algorithm: 'bin-packing',
  maxWidth: 2048,
  maxHeight: 2048,
  powerOfTwo: false,
  smart: true,
  square: false,
  allowRotation: false,
  tag: false,
  exclusiveTag: true,
  border: 0,
  logic: 'max-edge'
})

const handleImagesChange = async (files: File[]) => {
    await addImages(files)
    await generateSprite()
}

const handleRemove = async (id: string) => {
  removeImage(id)
  await generateSprite()
}

const handleClear = () => {
  clearImages()
  spriteResult.value = null
}

const handleOptionsUpdate = async (newOptions: SpritePackerOptions) => {
  options.value = newOptions
  spriteStore.updateOptions(newOptions)
  await generateSprite()
}

const generateSprite = async () => {
  if (images.value.length === 0) {
    spriteResult.value = null
    return
  }

  try {
    const result = await packSprites(images.value, options.value)
    spriteResult.value = result
    spriteStore.setConfig(result.config)
  } catch (err) {
    ElMessage.error(packError.value || '合图生成失败')
  }
}

const handleExport = async (format: string) => {
  if (!spriteResult.value) return

  exporting.value = true
  try {
    // 导出合图
    const blob = await compressImage(spriteResult.value.canvas, { format: 'png' })
    downloadImage(blob, `${safeExportName.value}.png`)

    // 导出配置
    if (spriteResult.value.config) {
      const ext = format === 'plist' ? 'plist' : 'json'
      downloadConfig(spriteResult.value.config, `${safeExportName.value}.${ext}`)
    }

    ElMessage.success(`导出 ${format.toUpperCase()} 配置成功`)
  } catch (err) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

const safeExportName = computed(() => {
  const name = exportName.value.trim()
  const sanitized = name.replace(/[\\/:*?"<>|]/g, '_')
  return sanitized || 'sprite'
})

// 监听图片变化，自动生成合图
watch(() => images.value.length, async () => {
  if (images.value.length > 0) {
    await generateSprite()
  }
})

</script>

<style scoped>
.pack-view {
  width: 100%;
  height: 100%;
}

.upload-card,
.preview-card,
.config-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filename-input {
  width: 160px;
}

.image-list {
  margin-top: 16px;
}
</style>

