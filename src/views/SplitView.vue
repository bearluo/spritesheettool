<template>
  <div class="split-view">
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
            </el-form>
            <el-divider />
            <p class="config-tip">设置默认行列数后，分割面板会自动带入这些参数，方便批量操作。</p>
            <el-button
              type="primary"
              :disabled="!selectedImage"
              @click="handleSplitSelected"
              block
            >
              使用参数分割当前图片
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import JSZip from 'jszip'
import ImageUploader from '@/components/ImageUploader.vue'
import SplitSpritePreview from '@/components/SplitSpritePreview.vue'
import { useImageProcessor } from '@/composables/useImageProcessor'

const { images, addImages, clearImages, splitImage } = useImageProcessor()

const defaultRows = ref(1)
const defaultCols = ref(1)
const defaultReplaceOriginal = ref(false)

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
  clearImages()
  await addImages(files)
}

const handleSplitSelected = () => {
  const target = selectedImage.value
  if (!target) {
    ElMessage.warning('请先上传并选择图片')
    return
  }
  // 分割图片并下载
  splitImage(target.id, defaultRows.value, defaultCols.value, { replaceOriginal: defaultReplaceOriginal.value })
    .then((resultImages) => {
      if (Array.isArray(resultImages) && resultImages.length > 0) {
        // 打包为 zip 并下载
        const zip = new JSZip()
        resultImages.forEach((img) => {
          // img.name 和 img.file 可能有 file 实例
          if (img.file) {
            zip.file(img.name, img.file)
          }
        })
        zip.generateAsync({ type: 'blob' }).then((content) => {
          // 创建下载链接并自动点击
          const a = document.createElement('a')
          a.href = URL.createObjectURL(content)
          a.download = `${target.name.replace(/\.[^/.]+$/, '')}_split.zip`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          // 清理 URL
          setTimeout(() => {
            URL.revokeObjectURL(a.href)
          }, 500)
        })
        ElMessage.success('子图分割并下载成功')
      } else {
        ElMessage.warning('分割没有生成任何图片')
      }
    })
    .catch((err) => {
      ElMessage.error(err?.message || '分割失败')
    })
}

</script>

<style scoped>
.split-view {
  width: 100%;
  height: 100%;
}

.panel-card {
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

.image-list {
  margin-top: 16px;
}

.preview-wrapper {
  flex: 1;
  display: flex;
  gap: 16px;
  align-items: center;
}

.preview-wrapper :deep(.image-wrapper) {
  width: 260px;
  height: 260px;
}

.preview-info {
  flex: 1;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.preview-info .title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 600;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}

.split-summary {
  margin-bottom: 12px;
  font-size: 13px;
  color: #606266;
}

.split-preview {
  position: relative;
  width: 100%;
  margin-bottom: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;
}

.split-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
