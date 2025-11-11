<template>
  <div class="split-preview">
    <div class="preview-canvas" v-if="image" :style="canvasStyle">
      <AppImage
        :src="image.dataUrl || image.url"
        :alt="image.name"
        :fit="fit"
        :width="displayWidth"
        :height="displayHeight"
      />
      <div class="grid-overlay" v-if="gridRows && gridCols" :style="gridStyle"></div>
    </div>
    <div class="preview-info" v-if="image">
      <p class="title" :title="image.name">{{ image.name }}</p>
      <p>尺寸：{{ image.width }} × {{ image.height }}</p>
      <p>大小：{{ formatSize(image.size) }}</p>
      <slot name="extra"></slot>
    </div>
    <div v-else class="empty">
      <slot name="empty">
        <el-empty description="暂无预览" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppImage from '@/components/common/Image.vue'
import type { ImageInfo } from '@/types/image'

const props = withDefaults(defineProps<{
  image?: ImageInfo | null
  fit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none'
  gridRows?: number
  gridCols?: number
  maxWidth?: number
  maxHeight?: number
}>(), {
  fit: 'contain',
  maxWidth: 1000,
  maxHeight: 1000
})

const gridStyle = computed(() => {
  if (!props.gridRows || !props.gridCols) return undefined
  const rows = Math.max(props.gridRows, 1)
  const cols = Math.max(props.gridCols, 1)
  return {
    backgroundImage:
      'linear-gradient(to right, rgba(64,158,255,0.6) 1px, transparent 1px), ' +
      'linear-gradient(to bottom, rgba(64,158,255,0.6) 1px, transparent 1px)',
    backgroundSize: `${100 / cols}% 100%, 100% ${100 / rows}%`,
    backgroundRepeat: 'repeat'
  }
})

const displayWidth = computed(() => {
  if (!props.image) return props.maxWidth
  return Math.min(props.image.width, props.maxWidth)
})

const displayHeight = computed(() => {
  if (!props.image) return props.maxHeight
  return Math.min(props.image.height, props.maxHeight)
})

const canvasStyle = computed(() => {
  const width = displayWidth.value
  const height = displayHeight.value
  return {
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: `${props.maxWidth}px`,
    margin: '0 auto'
  }
})

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.split-preview {
  width: 100%;
}

.preview-canvas {
  position: relative;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;
}

.preview-canvas :deep(.image-wrapper) {
  width: fit-content;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.preview-info {
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #ffffff;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.preview-info .title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 6px;
  font-weight: 600;
}

.preview-info .size-label {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
  color: #409eff;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
}
</style>
