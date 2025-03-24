<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { title } from './utils'

const FOOTER_DOMAINS = (import.meta.env.VITE_FOOTER_DOMAINS as string) || '{}'
const FOOTER =
  JSON.parse(FOOTER_DOMAINS)[window.location.hostname] ||
  (import.meta.env.VITE_FOOTER as string) ||
  ''
const ICP_DOMAINS = (import.meta.env.VITE_FOOTER_ICP_DOMAINS as string) || '{}'
const ICP = JSON.parse(ICP_DOMAINS)[window.location.hostname] || ''
const ICP_URL = (import.meta.env.VITE_FOOTER_ICP_URL as string) || ''

watch(title, (value) => {
  document.title = value ? `Silent Auction - ${value}` : 'Silent Auction'
})
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <img src="@/assets/logo.svg" class="navbar-icon" />
      <RouterLink to="/" class="navbar-title"
        ><span><strong>Silent Auction</strong></span></RouterLink
      >
    </nav>

    <main class="content">
      <RouterView />
    </main>

    <footer class="footer raw-text" v-if="FOOTER || ICP">
      <div v-html="FOOTER"></div>
      <div v-if="ICP">
        <a :href="ICP_URL" target="_blank" rel="noopener noreferrer">{{ ICP }}</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.navbar {
  display: flex;
  align-items: center;
  padding: 1em;
  gap: 0.8em;
}
.navbar > * {
  min-width: 0;
}
.navbar-icon {
  height: 1.5em;
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
  flex: 1 0 auto;
  padding: 1em;
  border-top: 1px solid var(--color-background-mute);
}
.footer {
  padding: 1em;
  text-align: center;
  color: var(--color-text-mute);
  border-top: 1px solid var(--color-background-mute);
  font-size: 0.8em;
}
</style>
