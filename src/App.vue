<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <nav class="navbar">
    <img src="@/assets/logo.svg" style="height: 1em" />
    <span><strong>Silent Auction</strong></span>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
  </nav>

  <main class="content">
    <RouterView />
  </main>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  padding: 1em;
  gap: 1em;
}

.content {
  padding: 1em;
  border-top: 1px solid var(--color-background-mute);
}
</style>
