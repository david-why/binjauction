<script setup lang="ts">
import LoaderIcon from '@/components/LoaderIcon.vue'
import { fetchMe, fetchWork, me } from '@/service'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const workId = route.params.id as string

const loading = ref(true)
const work = ref<WorkDetail | null>(null)

onMounted(async () => {
  fetchMe()
  work.value = await fetchWork(workId)
  loading.value = false
})
</script>

<template>
  <h1>Place a bid</h1>

  <div v-if="loading">Loading... <LoaderIcon></LoaderIcon></div>
  <div v-else-if="me === undefined">You have to log in to bid on a work.</div>
  <div v-else>
    <!-- form to bid -->
  </div>
</template>
