<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <nav class="navbar">
    <img src="@/assets/logo.svg" style="height: 1em" />
    <!-- <span style="height: 1em"> -->
    <span><strong>Silent Auction</strong></span>
    <!-- </span> -->
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
  </nav>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  padding: 1em;
  background-color: var(--color-background-mute);
  gap: 1em;
}
</style>
