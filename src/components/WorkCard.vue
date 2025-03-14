<script setup lang="ts">
import { getDisplayBid } from '@/utils'
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
  return getDisplayBid(props.work.highestBid)
})

function bidWork() {
  if (props.showBid) {
    router.push(`/works/${props.work.id}`)
  }
}
</script>

<template>
  <div class="work" :class="{ clickable: showBid }" @click="bidWork">
    <h3 class="work-title">{{ work.name }}</h3>
    <div v-if="showBid">
      <p><strong>Current bid</strong>: {{ displayBid }}</p>
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
.clickable {
  cursor: pointer;
}
.work-title {
  margin-block-end: 0.5em;
}
.work-image {
  max-width: 100%;
}
</style>
