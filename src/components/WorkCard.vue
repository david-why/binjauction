<script setup lang="ts">
import { getDisplayBid } from '@/utils'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps<{
  work: WorkDetail
}>()

const displayBid = computed(() => {
  return getDisplayBid(props.work.highestBid)
})

function bidWork() {
  router.push(`/works/${props.work.id}`)
}
</script>

<template>
  <div class="work" @click="bidWork">
    <div class="work-img">
      <img :src="work.img" :alt="work.name" />
    </div>
    <div>
      <h3 class="work-title">{{ work.name }}</h3>
      <p class="work-bid-line"><strong>Current bid</strong>: {{ displayBid }}</p>
    </div>
  </div>
</template>

<style scoped>
.work {
  padding: 1em;
  border: 1px solid var(--color-background-mute);
  border-radius: 0.5em;
  background-color: var(--color-background-mute);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1em;
}
.work-img img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
.work-title {
  margin-block-end: 0.5em;
}
.work-bid-line {
  margin-block-start: 0.5em;
  margin-block-end: 0;
}
</style>
