<template>
  <div class="image-uploader">
    <el-upload
      v-model:file-list="fileList"
      :auto-upload="false"
      :on-change="handleFileChange"
      :show-file-list="false"
      :multiple="true"
      :accept="'image/*'"
      drag
      class="upload-dragger"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 jpg/png/gif/webp 格式的图片文件
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles } from 'element-plus'

const emit = defineEmits<{
  'change': [files: File[]]
}>()

const fileList = ref<UploadFiles>([])

const handleFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  if (uploadFile.raw) {
    emit('change', [uploadFile.raw])
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-dragger {
  width: 100%;
}
</style>

