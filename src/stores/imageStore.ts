import { defineStore } from 'pinia'
import type { ImageInfo } from '@/types/image'

export const useImageStore = defineStore('image', {
  state: () => ({
    images: [] as ImageInfo[],
    selectedImages: [] as string[]
  }),

  getters: {
    imageCount: (state) => state.images.length,
    selectedCount: (state) => state.selectedImages.length,
    hasImages: (state) => state.images.length > 0
  },

  actions: {
    addImage(image: ImageInfo) {
      this.images.push(image)
    },

    removeImage(id: string) {
      const index = this.images.findIndex(img => img.id === id)
      if (index > -1) {
        const image = this.images[index]
        URL.revokeObjectURL(image.url)
        this.images.splice(index, 1)
        this.removeSelected(id)
      }
    },

    clearImages() {
      this.images.forEach(img => URL.revokeObjectURL(img.url))
      this.images = []
      this.selectedImages = []
    },

    toggleSelect(id: string) {
      const index = this.selectedImages.indexOf(id)
      if (index > -1) {
        this.selectedImages.splice(index, 1)
      } else {
        this.selectedImages.push(id)
      }
    },

    removeSelected(id: string) {
      const index = this.selectedImages.indexOf(id)
      if (index > -1) {
        this.selectedImages.splice(index, 1)
      }
    },

    selectAll() {
      this.selectedImages = this.images.map(img => img.id)
    },

    clearSelection() {
      this.selectedImages = []
    }
  }
})

