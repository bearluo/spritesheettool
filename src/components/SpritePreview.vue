<template>
  <div class="sprite-preview">
    <div v-if="!canvasUrl" class="empty-state">
      <el-empty description="暂无合图预览" />
    </div>
    <div v-else class="preview-container">
      <div class="preview-toolbar">
        <el-button-group>
          <el-button :icon="ZoomIn" @click="zoomIn" />
          <el-button :icon="ZoomOut" @click="zoomOut" />
          <el-button @click="resetZoom">重置</el-button>
        </el-button-group>
        <div class="zoom-info">缩放: {{ (zoom * 100).toFixed(0) }}%</div>
      </div>
      <div
        class="preview-content"
        ref="previewRef"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <div
          class="image-wrapper"
          :style="{
            transform: `scale(${zoom}) translate(${translateX}px, ${translateY}px)`
          }"
        >
          <AppImage
            ref="imgRef"
            :src="canvasUrl"
            alt="合图预览"
            fit="contain"
            :width="canvas?.width"
            :height="canvas?.height"
            @load="handleImageLoad"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import AppImage from '@/components/common/Image.vue'

const props = defineProps<{
  canvas?: HTMLCanvasElement
}>()

const previewRef = ref<HTMLElement>()
const imgRef = ref<InstanceType<typeof AppImage>>()
const zoom = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const canvasUrl = computed(() => {
  return props.canvas?.toDataURL()
})

/**
 * 计算适合的缩放比例，使图片完整显示在预览区域内
 */
const calculateFitZoom = () => {
  if (!props.canvas || !previewRef.value) {
    return 1
  }

  const canvas = props.canvas
  const container = previewRef.value
  
  // 获取容器的实际尺寸（减去内边距）
  const containerWidth = container.clientWidth - 40 // 留一些边距
  const containerHeight = container.clientHeight - 40
  
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  
  // 计算缩放比例，取较小的值以确保图片完整显示
  const scaleX = containerWidth / canvasWidth
  const scaleY = containerHeight / canvasHeight
  const fitZoom = Math.min(scaleX, scaleY, 1) // 不超过原始大小
  
  return Math.max(0.1, fitZoom) // 最小缩放0.1
}

/**
 * 应用适合的缩放并居中显示
 */
const applyFitZoom = () => {
  if (!props.canvas || !previewRef.value) {
    return
  }
  
  const fitZoom = calculateFitZoom()
  zoom.value = fitZoom
  
  // 重置位置到中心
  translateX.value = 0
  translateY.value = 0
}

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 3)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.1)
}

const resetZoom = () => {
  applyFitZoom()
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoom.value = Math.max(0.1, Math.min(3, zoom.value + delta))
}

const handleMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    e.preventDefault() // 阻止默认行为，避免拖动图片
    isDragging.value = true
    // 记录拖动起始时的鼠标位置和当前偏移
    dragStart.value = { 
      x: e.clientX - translateX.value,
      y: e.clientY - translateY.value
    }
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    // 直接计算偏移量（translate 在缩放后的坐标系中）
    translateX.value = e.clientX - dragStart.value.x
    translateY.value = e.clientY - dragStart.value.y
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleImageLoad = () => {
  // 图片加载完成后重新计算缩放
  nextTick(() => {
    applyFitZoom()
  })
}

// 监听canvas变化，自动应用适合的缩放
watch(() => props.canvas, () => {
  nextTick(() => {
    applyFitZoom()
  })
})

// 监听窗口大小变化，重新计算缩放
onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    if (props.canvas) {
      applyFitZoom()
    }
  })
  
  if (previewRef.value) {
    resizeObserver.observe(previewRef.value)
  }
  
  // 初始化时应用适合的缩放
  if (props.canvas) {
    nextTick(() => {
      applyFitZoom()
    })
  }
})
</script>

<style scoped>
.sprite-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #dcdfe6;
}

.zoom-info {
  font-size: 14px;
  color: #606266;
}

.preview-content {
  flex: 1;
  overflow: auto;
  background: #f5f7fa;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-content:active {
  cursor: grabbing;
}

.image-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
}
</style>

