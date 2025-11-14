<template>
  <el-config-provider>
    <div class="app-container" id="app-container">
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="打包" name="pack">
          <PackPanel />
        </el-tab-pane>
        <el-tab-pane label="拆包" name="unpack">
          <UnpackPanel />
        </el-tab-pane>
        <el-tab-pane label="拆分" name="split">
          <SplitPanel />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import PackPanel from './views/PackPanel.vue'
import UnpackPanel from './views/UnpackPanel.vue'
import SplitPanel from './views/SplitPanel.vue'

const activeTab = ref('pack')

</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-tabs {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.main-tabs :deep(.el-tabs__header) {
  flex-shrink: 0;
  margin: 0;
  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
}

.main-tabs :deep(.el-tabs__content) {
  flex: 1;
  height: auto !important;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  box-sizing: border-box;
}

.main-tabs :deep(.el-tab-pane) {
  height: auto;
  min-height: 0;
  box-sizing: border-box;
}
</style>
