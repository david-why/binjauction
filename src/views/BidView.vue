<script setup lang="ts">
import LoaderIcon from '@/components/LoaderIcon.vue'
import WorkCard from '@/components/WorkCard.vue'
import { fetchMe, fetchWork, me, placeBid } from '@/service'
import { getDisplayBid } from '@/utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const workId = route.params.id as string

const bidAmount = ref<number | ''>('')

const loading = ref(true)
const work = ref<WorkDetail | null>(null)

const bidMin = computed(() => {
  return (work.value?.highestBid?.amount ?? 90) + 10
})
watch(
  bidMin,
  (min) => {
    if (bidAmount.value === '' || bidAmount.value < min) {
      bidAmount.value = min
    }
  },
  { immediate: true },
)

const displayBid = computed(() => {
  return getDisplayBid(work.value?.highestBid)
})

async function doPlaceBid() {
  if (bidAmount.value === '' || bidAmount.value < bidMin.value) {
    alert(`Bid amount must be at least ¥${bidMin.value}`)
    return
  }
  if (confirm(`Place a bid of ¥${bidAmount.value}? You CANNOT take back your bid!`)) {
    try {
      await placeBid(workId, bidAmount.value)
    } catch (error) {
      console.error(error)
      alert('Failed to place bid! Someone was probably faster than you...')
    }
    location.reload()
  }
}

onMounted(async () => {
  fetchMe()
  work.value = await fetchWork(workId)
  if (!work.value) {
    router.push('/')
  }
  loading.value = false
})
</script>

<template>
  <div v-if="loading">Loading... <LoaderIcon></LoaderIcon></div>
  <div v-else-if="me === undefined">You have to log in to bid on a work.</div>
  <div v-else-if="work">
    <h1>Place a Bid</h1>
    <p><strong>Current bid</strong>: {{ displayBid }}</p>
    <form @submit.prevent="doPlaceBid">
      <div class="bid-form">
        <input
          type="number"
          placeholder="Your bid (in CNY)"
          :min="bidMin"
          autocomplete="off"
          required
          v-model="bidAmount"
        />
        <button type="submit">Place bid</button>
      </div>
    </form>
    <WorkCard :work="work" :show-bid="false"></WorkCard>
  </div>
</template>

<style scoped>
.bid-form {
  display: flex;
  gap: 8px;
  margin-block-end: 1em;
}
</style>
