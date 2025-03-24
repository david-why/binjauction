<script setup lang="ts">
import { resolveR2 } from '@/utils'

defineProps<{
  src: string
  alt?: string
}>()
</script>

<template>
  <img :src="resolveR2(src)" :alt="alt" />
</template>
