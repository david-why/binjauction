<script setup lang="ts">
import LoaderIcon from '@/components/LoaderIcon.vue'
import WorkCard from '@/components/WorkCard.vue'
import { fetchWorks } from '@/service'
import { computed, onMounted, ref } from 'vue'

const loading = ref(true)
const works = ref<WorkDetail[]>([])

const displayWorks = computed(() => {
  return works.value.map((work) => {
    return {
      ...work,
      dispBid: work.highestBid?.amount || 'No bid yet',
    }
  })
})

onMounted(async () => {
  works.value = await fetchWorks()
  loading.value = false
})
</script>

<template>
  <h1>Silent Auction</h1>

  <div v-if="loading">Loading works, please wait... <LoaderIcon></LoaderIcon></div>
  <div v-else-if="!works.length">No works yet. Please check back later!</div>
  <ul v-else class="works-list">
    <li v-for="work in displayWorks" :key="work.id" class="work-item">
      <WorkCard :work="work"></WorkCard>
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
