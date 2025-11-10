import { defineStore } from 'pinia'
import type { SpriteSheetConfig, SpritePackerOptions } from '@/types/sprite'

export const useSpriteStore = defineStore('sprite', {
  state: () => ({
    config: null as SpriteSheetConfig | null,
    spriteImageUrl: null as string | null,
    options: {
      padding: 2,
      algorithm: 'bin-packing' as const,
      maxWidth: 2048,
      maxHeight: 2048,
      powerOfTwo: false,
      smart: true,
      square: false,
      allowRotation: false,
      tag: false,
      exclusiveTag: true,
      border: 0,
      logic: 'max-edge'
    } as SpritePackerOptions
  }),

  getters: {
    hasConfig: (state) => state.config !== null,
    hasSpriteImage: (state) => state.spriteImageUrl !== null
  },

  actions: {
    setConfig(config: SpriteSheetConfig) {
      this.config = config
    },

    setSpriteImageUrl(url: string) {
      this.spriteImageUrl = url
    },

    updateOptions(options: Partial<SpritePackerOptions>) {
      this.options = { ...this.options, ...options }
    },

    clear() {
      if (this.spriteImageUrl) {
        URL.revokeObjectURL(this.spriteImageUrl)
      }
      this.config = null
      this.spriteImageUrl = null
    }
  }
})

