<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps<{
  work: WorkDetail
}>()

const displayBid = computed(() => {
  return props.work.highestBid?.amount || 'No bid yet'
})

function bidWork() {
  router.push(`/works/${props.work.id}/bid`)
}
</script>

<template>
  <div class="work">
    <h3 class="work-title">{{ work.name }}</h3>
    <div>
      <a :href="work.img" target="_blank"><img :src="work.img" class="work-image" /></a>
    </div>
    <p>{{ work.description }}</p>
    <p>Current bid: {{ displayBid }}</p>
    <div>
      <button @click="bidWork">Bid!</button>
    </div>
  </div>
</template>

<style scoped>
.work {
  padding: 1em;
  border: 1px solid var(--color-background-mute);
  border-radius: 0.5em;
  background-color: var(--color-background-mute);
}
.work-title {
  margin-block-end: 0.5em;
}
.work-image {
  max-width: 100%;
}
</style>
