<template>
  <div class="config-editor">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="配置选项" name="options">
        <el-form :model="options" label-width="120px">
          <el-form-item label="排列算法">
            <el-select
              v-model="options.algorithm"
              placeholder="选择算法"
              @change="handleOptionsChange"
            >
              <el-option label="简单排列" value="simple" />
              <el-option label="最优打包" value="bin-packing" />
            </el-select>
          </el-form-item>

          <component
            v-if="currentOptionsComponent"
            :is="currentOptionsComponent"
            :key="options.algorithm"
            :model-value="options"
            @update:model-value="handleChildOptionsUpdate"
          />
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="JSON配置" name="json">
        <el-input
          v-model="jsonConfig"
          type="textarea"
          :rows="15"
          readonly
          class="json-editor"
        />
        <div class="json-actions">
          <el-button type="primary" @click="copyConfig">复制配置</el-button>
          <el-dropdown @command="handleDownloadFormat">
            <el-button type="success">
              下载配置<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="json">下载为 JSON</el-dropdown-item>
                <el-dropdown-item command="plist">下载为 PLIST</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { SpritePackerOptions, SpriteSheetConfig } from '@/types/sprite'
import { exportJsonConfig, downloadConfig as downloadConfigFile } from '@/utils/configParser'
import SimplePackOptions from '@/components/packOptions/SimplePackOptions.vue'
import BinPackingOptions from '@/components/packOptions/BinPackingOptions.vue'

const optionComponentMap: Record<string, Component> = {
  simple: SimplePackOptions,
  'bin-packing': BinPackingOptions
}

const props = defineProps<{
  options: SpritePackerOptions
  config?: SpriteSheetConfig | null
}>()

const emit = defineEmits<{
  'update:options': [options: SpritePackerOptions]
}>()

const activeTab = ref('options')
const options = ref<SpritePackerOptions>({ ...props.options })

const currentOptionsComponent = computed<Component | null>(() => {
  const algorithm = options.value.algorithm ?? 'simple'
  return optionComponentMap[algorithm] ?? null
})

const jsonConfig = computed(() => {
  if (props.config) {
    return exportJsonConfig(props.config)
  }
  return ''
})

const handleOptionsChange = () => {
  emit('update:options', { ...options.value })
}

const handleChildOptionsUpdate = (newOptions: SpritePackerOptions) => {
  options.value = { ...options.value, ...newOptions, algorithm: options.value.algorithm }
  emit('update:options', { ...options.value })
}

const copyConfig = async () => {
  if (!jsonConfig.value) {
    ElMessage.warning('暂无配置可复制')
    return
  }
  try {
    await navigator.clipboard.writeText(jsonConfig.value)
    ElMessage.success('配置已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const handleDownloadFormat = (format: string) => {
  if (!props.config) {
    ElMessage.warning('暂无配置可下载')
    return
  }
  const filename = format === 'plist' ? 'sprite-config.plist' : 'sprite-config.json'
  downloadConfigFile(props.config, filename)
  ElMessage.success(`配置已下载为 ${format.toUpperCase()} 格式`)
}

watch(
  () => props.options,
  (newOptions) => {
    options.value = { ...newOptions }
  },
  { deep: true }
)

watch(
  () => options.value.algorithm,
  () => {
    handleOptionsChange()
  }
)
</script>

<style scoped>
.config-editor {
  width: 100%;
}

.json-editor {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.json-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>

