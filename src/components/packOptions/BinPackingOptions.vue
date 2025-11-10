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
        :model-value="value.maxWidth ?? 2048"
        :min="256"
        :max="8192"
        :step="256"
        @update:modelValue="updateMaxWidth"
      />
    </el-form-item>

    <el-form-item label="最大高度">
      <el-input-number
        :model-value="value.maxHeight ?? 2048"
        :min="256"
        :max="8192"
        :step="256"
        @update:modelValue="updateMaxHeight"
      />
    </el-form-item>

    <el-form-item label="2 的幂次方">
      <el-switch
        :model-value="value.powerOfTwo ?? false"
        @update:modelValue="updatePowerOfTwo"
      />
    </el-form-item>

    <el-form-item label="智能模式">
      <el-switch
        :model-value="value.smart ?? true"
        @update:modelValue="updateSmart"
      />
    </el-form-item>

    <el-form-item label="正方形画布">
      <el-switch
        :model-value="value.square ?? false"
        @update:modelValue="updateSquare"
      />
    </el-form-item>

    <el-form-item label="允许旋转">
      <el-switch
        :model-value="value.allowRotation ?? false"
        @update:modelValue="updateAllowRotation"
      />
    </el-form-item>

    <!-- <el-form-item label="标签分组">
      <el-switch
        :model-value="value.tag ?? false"
        @update:modelValue="updateTag"
      />
    </el-form-item> -->

    <!-- <el-form-item label="标签独占 Bin">
      <el-switch
        :model-value="value.exclusiveTag ?? true"
        @update:modelValue="updateExclusiveTag"
      />
    </el-form-item> -->

    <el-form-item label="边缘留白">
      <el-input-number
        :model-value="value.border ?? 0"
        :min="0"
        :max="512"
        @update:modelValue="updateBorder"
      />
    </el-form-item>

    <el-form-item label="排序逻辑">
      <el-select
        :model-value="value.logic ?? 'max-edge'"
        placeholder="选择逻辑"
        @update:modelValue="updateLogic"
      >
        <el-option label="按边长优先" value="max-edge" />
        <el-option label="按面积优先" value="max-area" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-alert
        title="最优打包使用 MaxRects 算法，布局更紧凑，适合大批量或尺寸差异大的图片。"
        type="success"
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
  emitUpdate({ maxWidth: val ?? 2048 })
}

const updateMaxHeight = (val: number | undefined) => {
  emitUpdate({ maxHeight: val ?? 2048 })
}

const updatePowerOfTwo = (val: boolean | undefined) => {
  emitUpdate({ powerOfTwo: Boolean(val) })
}

const updateSmart = (val: boolean | undefined) => {
  emitUpdate({ smart: val ?? true })
}

const updateSquare = (val: boolean | undefined) => {
  emitUpdate({ square: Boolean(val) })
}

const updateAllowRotation = (val: boolean | undefined) => {
  emitUpdate({ allowRotation: Boolean(val) })
}

// const updateTag = (val: boolean | undefined) => {
//   emitUpdate({ tag: Boolean(val) })
// }

// const updateExclusiveTag = (val: boolean | undefined) => {
//   emitUpdate({ exclusiveTag: val ?? true })
// }

const updateBorder = (val: number | undefined) => {
  emitUpdate({ border: val ?? 0 })
}

const updateLogic = (val: 'max-area' | 'max-edge' | undefined) => {
  emitUpdate({ logic: val ?? 'max-edge' })
}
</script>

<style scoped>
.algorithm-tip {
  padding: 6px 12px;
}
</style>

