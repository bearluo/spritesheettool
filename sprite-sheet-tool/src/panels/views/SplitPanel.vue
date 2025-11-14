<template>
  <div class="split-panel">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header">
              <span>图片上传</span>
            </div>
          </template>
          <ImageUploader @change="handleImagesChange" />
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card class="panel-card">
          <template #header>
            <div class="card-header">
              <span>预览</span>
            </div>
          </template>
          <div v-if="selectedImage" class="preview-wrapper">
            <SplitSpritePreview
              :image="selectedImage"
              :gridRows="defaultRows"
              :gridCols="defaultCols"
            />
          </div>
          <div v-else class="empty-state">
            <el-empty description="请上传并选择图片" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="panel-card">
          <template #header>
            <span>属性配置</span>
          </template>
          <div class="config-body">
            <el-form label-width="90px" size="small">
              <el-form-item label="默认行数">
                <el-input-number v-model="defaultRows" :min="1" />
              </el-form-item>
              <el-form-item label="默认列数">
                <el-input-number v-model="defaultCols" :min="1" />
              </el-form-item>
              <!-- <el-form-item label="替换原图">
                <el-switch v-model="defaultReplaceOriginal" />
              </el-form-item> -->
            </el-form>
            <el-divider />
            <p class="config-tip">设置默认行列数后，分割面板会自动带入这些参数，方便批量操作。</p>
            <el-button
              type="primary"
              :disabled="!selectedImage || splitting"
              :loading="splitting"
              @click="handleSplitSelected"
              block
            >
              {{ splitting ? '拆分中...' : '使用参数分割当前图片' }}
            </el-button>
            <el-button
              v-if="splitResult.length > 0"
              type="success"
              :disabled="saving"
              :loading="saving"
              @click="handleSaveToProject"
              block
              style="margin-top: 12px"
            >
              {{ saving ? '保存中...' : `保存 ${splitResult.length} 个子图到项目` }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMessage } from '../composables/useMessage'
import ImageUploader from '../components/ImageUploader.vue'
import ImageList from '../components/ImageList.vue'
import SplitSpritePreview from '../components/SplitSpritePreview.vue'
import { useImageProcessor } from '../composables/useImageProcessor'
import { FileOperations, CocosApi, ErrorHandler, Logger } from '../../core'
import type { ImageInfo } from '../../core'

const { images, addImages, removeImage, clearImages, splitImage } = useImageProcessor()
const { success, error, warning } = useMessage()

const defaultRows = ref(1)
const defaultCols = ref(1)
const defaultReplaceOriginal = ref(false)
const splitting = ref(false)
const saving = ref(false)
const splitResult = ref<ImageInfo[]>([])

watch(defaultRows, (val) => {
  if (val < 1) defaultRows.value = 1
})

watch(defaultCols, (val) => {
  if (val < 1) defaultCols.value = 1
})

const selectedImage = computed(() => {
  return images.value[0] || null
})

const handleImagesChange = async (files: File[]) => {
  try {
    clearImages()
    splitResult.value = []
    await addImages(files)
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('添加图片失败', err)
    error(errorMessage)
  }
}

const handleRemove = (id: string) => {
  removeImage(id)
  if (selectedImage.value?.id === id) {
    splitResult.value = []
  }
}

const handleClear = () => {
  clearImages()
  splitResult.value = []
}

const handleSplitSelected = async () => {
  const target = selectedImage.value
  if (!target) {
    warning('请先上传并选择图片')
    return
  }

  if (defaultRows.value < 1 || defaultCols.value < 1) {
    warning('行数和列数必须大于 0')
    return
  }

  try {
    splitting.value = true
    Logger.info('开始拆分图片', `图片: ${target.name}`, `行列: ${defaultRows.value} × ${defaultCols.value}`)
    const resultImages = await splitImage(
      target.id,
      defaultRows.value,
      defaultCols.value,
      { replaceOriginal: defaultReplaceOriginal.value }
    )
    splitResult.value = resultImages
    Logger.info('拆分成功', `子图数量: ${resultImages.length}`)
    success(`成功拆分 ${resultImages.length} 个子图`)
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('拆分失败', err)
    error(errorMessage)
  } finally {
    splitting.value = false
  }
}

const handleSaveToProject = async () => {
  if (splitResult.value.length === 0) {
    warning('请先拆分图片')
    return
  }

  try {
    saving.value = true
    Logger.info('开始保存子图到项目', `子图数量: ${splitResult.value.length}`)
    
    // 保存到项目
    const outputPath = 'assets/split-sprites'
    
    // 确保目录存在
    await FileOperations.ensureDirectory(outputPath)
    
    // 保存所有子图
    for (let i = 0; i < splitResult.value.length; i++) {
      const image = splitResult.value[i]
      if (image.file) {
        const imagePath = `${outputPath}/${image.name}`
        Logger.debug(`保存子图 ${i + 1}/${splitResult.value.length}:`, image.name)
        await FileOperations.writeImageFromBlob(imagePath, image.file)
      }
    }
    
    // 刷新资源数据库
    for (let i = 0; i < splitResult.value.length; i++) {
      const image = splitResult.value[i]
      if (image.file) {
        const imagePath = `${outputPath}/${image.name}`
        await CocosApi.refreshAssetDatabase(imagePath)
      }
    }
    Logger.info('资源数据库已刷新')
    
    success(`已保存 ${splitResult.value.length} 个子图到项目`)
  } catch (err) {
    const errorMessage = ErrorHandler.getErrorMessage(err)
    Logger.error('保存子图失败', err)
    error(errorMessage)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.split-panel {
  padding: calc(var(--size-base, 4) * 5px);
  min-height: 100%;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.panel-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-list {
  margin-top: 16px;
}

.preview-wrapper {
  min-height: 400px;
}

.empty-state {
  padding: 40px 0;
}

.config-body {
  padding: 12px 0;
}

.config-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 16px;
  line-height: 1.5;
}

.split-result {
  margin-top: 16px;
}
</style>

