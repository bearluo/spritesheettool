<template>
  <div class="image-uploader">
    <el-upload
      :auto-upload="false"
      :on-change="handleFileChange"
      :show-file-list="false"
      :multiple="multiple"
      :accept="accept"
      drag
      class="upload-dragger"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，<em>点击上传</em>
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
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

withDefaults(defineProps<{
  multiple?: boolean
  accept?: string
}>(), {
  multiple: false,
  accept: 'image/*'
})

const emit = defineEmits<{
  change: [files: File[]]
}>()

const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    const files = uploadFile.raw instanceof FileList 
      ? Array.from(uploadFile.raw) 
      : [uploadFile.raw as File]
    emit('change', files)
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

