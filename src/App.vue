<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { fetchMe, logout, me } from './service'
const route = useRoute()

const title = computed(() => {
  switch (route.name) {
    case 'about':
      return 'Silent Auction: About'
    case 'login':
      return 'Silent Auction: Login'
    case 'bid':
      return 'Silent Auction: Place Bid'
    case 'admin':
      return 'Silent Auction: Admin'
    default:
      return 'Silent Auction'
  }
})
watch(title, (value) => {
  document.title = value
})

async function doLogout() {
  if (confirm('Are you sure you want to logout?')) {
    await logout()
  }
}

onMounted(() => {
  fetchMe()
})
</script>

<template>
  <nav class="navbar">
    <img src="@/assets/logo.svg" class="navbar-icon" />
    <RouterLink to="/" class="navbar-title"
      ><span><strong>Silent Auction</strong></span></RouterLink
    >
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/admin" v-if="me?.role === 1">Admin</RouterLink>
    <RouterLink to="/login" v-if="!me">Login</RouterLink>
    <a v-else @click="doLogout">Logout</a>
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
.navbar > * {
  min-width: 0;
}
.navbar-icon {
  height: 1em;
  flex: 0 0 auto;
}
.navbar-title {
  flex: 0 0 auto;
}
.navbar-title * {
  color: var(--color-text);
  text-wrap: nowrap;
}
.content {
  padding: 1em;
  border-top: 1px solid var(--color-background-mute);
}
</style>
