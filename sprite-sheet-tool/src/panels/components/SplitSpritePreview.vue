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
import type { ImageInfo } from '../../core'
import AppImage from './AppImage.vue'

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
  if (!props.gridRows || !props.gridCols || !props.image) return undefined
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

.preview-canvas img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.preview-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.preview-info .title {
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  padding: 40px 0;
}
</style>

