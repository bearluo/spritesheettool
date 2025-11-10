<template>
  <div class="pack-options">
    <el-form-item label="子图间距">
      <el-input-number
        :model-value="value.padding ?? 0"
        :min="0"
        :max="50"
        @update:modelValue="updatePadding"
      />
    </el-form-item>

    <el-form-item label="最大宽度">
      <el-input-number
        :model-value="value.maxWidth ?? 4096"
        :min="256"
        :max="8192"
        :step="256"
        @update:modelValue="updateMaxWidth"
      />
    </el-form-item>

    <el-form-item>
      <el-alert
        title="简单排列按顺序逐行放置图片，适合数量较少或尺寸接近的图片。"
        type="info"
        :closable="false"
        show-icon
        class="algorithm-tip"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpritePackerOptions } from '@/types/sprite'

const props = defineProps<{
  modelValue: SpritePackerOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [SpritePackerOptions]
}>()

const value = computed(() => props.modelValue)

function emitUpdate(partial: Partial<SpritePackerOptions>) {
  emit('update:modelValue', { ...value.value, ...partial })
}

const updatePadding = (val: number | undefined) => {
  emitUpdate({ padding: val ?? 0 })
}

const updateMaxWidth = (val: number | undefined) => {
  emitUpdate({ maxWidth: val ?? 4096 })
}
</script>

<style scoped>
.algorithm-tip {
  padding: 6px 12px;
}
</style>

