<script setup lang="ts">
import LoaderIcon from '@/components/LoaderIcon.vue'
import WorkCard from '@/components/WorkCard.vue'
import { fetchWorks } from '@/service'
import { title } from '@/utils'
import { onMounted, ref } from 'vue'

const loading = ref(true)
const works = ref<WorkDetail[]>([])

onMounted(async () => {
  title.value = ''
  loading.value = true
  works.value = await fetchWorks()
  loading.value = false
})
</script>

<template>
  <h1>Silent Auction</h1>

  <div v-if="loading">Loading works, please wait... <LoaderIcon></LoaderIcon></div>
  <div v-else-if="!works.length">No works yet. Please check back later!</div>
  <ul v-else class="works-list">
    <li v-for="work in works" :key="work.id" class="work-item">
      <WorkCard :work="work"></WorkCard>
      <!-- <h2>{{ work.name }}</h2> -->
    </li>
  </ul>
</template>

<style scoped>
.works-list {
  list-style: none;
  padding: 0;
}
.work-item + .work-item {
  margin-top: 1em;
}
</style>
