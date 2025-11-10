<template>
  <div class="image-list">
    <div v-if="images.length === 0" class="empty-state">
      <el-empty description="暂无图片" />
    </div>
    <div v-else class="image-grid">
      <div
        v-for="image in images"
        :key="image.id"
        class="image-item"
        :class="{ selected: isSelected(image.id) }"
        @click="toggleSelect(image.id)"
      >
        <div class="image-preview">
          <AppImage :src="image.url" :alt="image.name" fit="contain" />
        </div>
        <div class="image-info">
          <div class="image-name" :title="image.name">{{ image.name }}</div>
          <div class="image-size">{{ image.width }} × {{ image.height }}</div>
        </div>
        <el-button
          class="remove-btn"
          type="danger"
          :icon="Delete"
          circle
          size="small"
          @click.stop="handleRemove(image.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import type { ImageInfo } from '@/types/image'
import { useImageStore } from '@/stores/imageStore'
import AppImage from '@/components/common/Image.vue'

defineProps<{
  images: ImageInfo[]
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const imageStore = useImageStore()

const isSelected = (id: string) => {
  return imageStore.selectedImages.includes(id)
}

const toggleSelect = (id: string) => {
  imageStore.toggleSelect(id)
}

const handleRemove = (id: string) => {
  emit('remove', id)
}
</script>

<style scoped>
.image-list {
  width: 100%;
}

.empty-state {
  padding: 40px 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.image-item {
  position: relative;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.image-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.image-item.selected {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.image-preview {
  width: 100%;
  height: 120px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-info {
  padding: 8px;
  background: #fff;
}

.image-name {
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.image-size {
  font-size: 11px;
  color: #909399;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .remove-btn {
  opacity: 1;
}
</style>

