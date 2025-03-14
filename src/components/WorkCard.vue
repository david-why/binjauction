<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = withDefaults(
  defineProps<{
    work: WorkDetail
    showBid?: boolean
  }>(),
  {
    showBid: true,
  },
)

const displayBid = computed(() => {
  if (props.work.highestBid) {
    return `¥${props.work.highestBid.amount} (${props.work.highestBid.user.obfsPhone})`
  }
  return 'No bid yet'
})

function bidWork() {
  router.push(`/works/${props.work.id}`)
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
    <div v-if="showBid">
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
