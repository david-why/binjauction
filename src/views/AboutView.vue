<script setup lang="ts">
import { title } from '@/utils'
import { onMounted } from 'vue'

onMounted(() => {
  title.value = 'About'
})
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style scoped></style>
