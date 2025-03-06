<script setup lang="ts">
import { RouterView } from 'vue-router'
import { logout, me } from './service'
</script>

<template>
  <nav class="navbar">
    <img src="@/assets/logo.svg" style="height: 1em" />
    <RouterLink to="/"
      ><span class="navbar-title"><strong>Silent Auction</strong></span></RouterLink
    >
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/login" v-if="!me">Login</RouterLink>
    <a v-else @click="logout">Logout</a>
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
.navbar-title * {
  color: var(--color-text);
}
.content {
  padding: 1em;
  border-top: 1px solid var(--color-background-mute);
}
</style>
