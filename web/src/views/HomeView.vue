<script setup lang="ts">
import LoaderIcon from '@/components/LoaderIcon.vue'
import { fetchWorks } from '@/service'
import { computed, onMounted, ref } from 'vue'

const loading = ref(true)
const works = ref<Work[]>([])

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

  <h2>Works</h2>

  <div v-if="loading">Loading works, please wait... <LoaderIcon></LoaderIcon></div>
  <div v-else-if="!works.length"></div>
  <ul v-else class="works-list">
    <div v-for="work in displayWorks" :key="work.id">
      <li>
        <div>
          <h3>{{ work.name }}</h3>
          <p>{{ work.description }}</p>
          <p>Current bid: {{ work.dispBid }}</p>
        </div>
      </li>
    </div>
  </ul>
</template>
