<template>
  <div class="config-editor">
    <el-form :model="options" label-width="100px" size="small">
      <el-form-item label="排列算法">
        <el-select
          v-model="options.algorithm"
          placeholder="选择算法"
          :teleported="false"
          @change="handleChange"
        >
          <el-option label="简单排列" value="simple" />
          <el-option label="最优打包" value="bin-packing" />
        </el-select>
      </el-form-item>

      <el-form-item label="间距">
        <el-input-number
          v-model="options.padding"
          :min="0"
          :max="100"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="最大宽度">
        <el-input-number
          v-model="options.maxWidth"
          :min="64"
          :max="8192"
          :step="64"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="最大高度">
        <el-input-number
          v-model="options.maxHeight"
          :min="64"
          :max="8192"
          :step="64"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="2的幂次方">
        <el-switch
          v-model="options.powerOfTwo"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item v-if="options.algorithm === 'bin-packing'" label="允许旋转">
        <el-switch
          v-model="options.allowRotation"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item v-if="options.algorithm === 'bin-packing'" label="正方形排列">
        <el-switch
          v-model="options.square"
          @change="handleChange"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SpritePackerOptions } from '../../core'

const props = defineProps<{
  options: SpritePackerOptions
}>()

const emit = defineEmits<{
  'update:options': [options: SpritePackerOptions]
}>()

const options = ref<SpritePackerOptions>({ ...props.options })

const handleChange = () => {
  emit('update:options', { ...options.value })
}

watch(
  () => props.options,
  (newOptions) => {
    options.value = { ...newOptions }
  },
  { deep: true }
)
</script>

<style scoped>
.config-editor {
  width: 100%;
}
</style>

