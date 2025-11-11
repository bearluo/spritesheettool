<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <h1>合图拆图工具</h1>
      </el-header>
      <el-container>
        <el-aside width="200px" class="app-sidebar">
          <el-menu
            :default-active="activeMenu"
            @select="handleMenuSelect"
            router
          >
            <el-menu-item index="/pack">
              <el-icon><Grid /></el-icon>
              <span>合图</span>
            </el-menu-item>
            <el-menu-item index="/unpack">
              <el-icon><Scissor /></el-icon>
              <span>拆图</span>
            </el-menu-item>
            <el-menu-item index="/split">
              <el-icon><Grid /></el-icon>
              <span>帧序列分割</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Grid, Scissor } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeMenu = ref(route.path)

const handleMenuSelect = (index: string) => {
  router.push(index)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
}

.app-container {
  height: 100%;
}

.app-header {
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.app-header h1 {
  font-size: 20px;
  font-weight: 500;
}

.app-sidebar {
  background: #fff;
  border-right: 1px solid #dcdfe6;
}

.app-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>

