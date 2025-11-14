<template>
  <div
    class="image-wrapper"
    :style="wrapperStyle"
  >
    <img
      :src="src"
      :alt="alt"
      :style="imgStyle"
      draggable="false"
      @load="$emit('load', $event)"
      @error="$emit('error', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  fit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none'
}>()

defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

const alt = computed(() => props.alt ?? '')

function normalizeSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') {
    return `${value}px`
  }
  return value
}

const wrapperStyle = computed(() => {
  const styles: Record<string, string> = {}
  const width = normalizeSize(props.width)
  const height = normalizeSize(props.height)
  if (width) styles.width = width
  if (height) styles.height = height
  return styles
})

const imgStyle = computed(() => ({
  objectFit: props.fit ?? 'contain',
  maxWidth: '100%',
  maxHeight: '100%'
}))
</script>

<style scoped>
.image-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%);
  background-size: calc(var(--size-base, 4) * 4px) calc(var(--size-base, 4) * 4px);
  background-position: 0 0, 0 calc(var(--size-base, 4) * 2px), calc(var(--size-base, 4) * 2px) calc(var(--size-base, 4) * -2px), calc(var(--size-base, 4) * -2px) 0;
  overflow: hidden;
  border-radius: calc(var(--size-base, 4) * 1px);
  box-sizing: border-box;
}

.image-wrapper img {
  display: block;
  pointer-events: none;
  user-select: none;
}
</style>

