<script setup lang="ts">
import LoaderIcon from '@/components/LoaderIcon.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { fetchMe, fetchWork, me, placeBid, updateUserName } from '@/service'
import { getDisplayBid, title } from '@/utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const workId = route.params.id as string

const bidAmount = ref<number | ''>('')
const name = ref('')
watch(
  me,
  (me) => {
    name.value = me?.name || ''
  },
  { immediate: true },
)

const isPlacingBid = ref(false)
const loading = ref(true)
const work = ref<WorkDetail | null>(null)

const bidMin = computed(() => {
  if (!work.value) {
    return 100
  }
  if (work.value.highestBid) {
    return work.value.highestBid.amount + 10
  }
  return work.value.minBid
})
watch(
  bidMin,
  (bidMin) => {
    bidAmount.value = bidMin
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
  if (name.value === '') {
    alert('Please enter your name')
    return
  }
  if (confirm(`Place a bid of ¥${bidAmount.value}? You CANNOT take back your bid!`)) {
    isPlacingBid.value = true
    try {
      if (name.value !== me.value?.name) {
        await updateUserName(name.value)
      }
    } catch (error) {
      console.error(error)
    }
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
  title.value = ''
  fetchMe()
  work.value = await fetchWork(workId)
  if (!work.value) {
    router.push('/')
  }
  title.value = work.value.name
  loading.value = false
})
</script>

<template>
  <div v-if="loading">Loading... <LoaderIcon></LoaderIcon></div>
  <div v-else-if="work">
    <h1>{{ work.name }}</h1>
    <div>
      <img class="work-image" :src="work.img" />
    </div>
    <p>{{ work.description }}</p>
    <div>
      <p><strong>Current bid</strong>: {{ displayBid }}</p>
    </div>
    <h2>Place a Bid</h2>
    <div v-if="me">
      <p>
        <b>Minimum bid</b>: ¥{{ bidMin }}
        <span v-if="work.highestBid">(at least ¥10 higher than the current highest bid)</span>
      </p>
      <form @submit.prevent="doPlaceBid">
        <div class="input-form bid-form">
          <div>
            <label for="bidAmount" class="required-label">Your bid</label>
            <input
              id="bidAmount"
              type="number"
              :min="bidMin"
              autocomplete="off"
              :disabled="isPlacingBid"
              required
              v-model="bidAmount"
            />
          </div>
          <div>
            <label for="name" class="required-label">Your name</label>
            <input
              id="name"
              type="text"
              autocomplete="off"
              :disabled="isPlacingBid"
              required
              v-model="name"
            />
          </div>
          <div>
            <div></div>
            <div>This name will be publicly displayed to everyone.</div>
          </div>
          <div class="row">
            <LoadingButton type="submit" :loading="isPlacingBid">Place bid</LoadingButton>
          </div>
        </div>
      </form>
    </div>
    <div v-else>
      <p>You need to log in to place a bid.</p>
      <button @click="router.push('/login')">Log in</button>
    </div>
  </div>
</template>

<style scoped>
.bid-form {
  margin-block-end: 1em;
}
.work-image {
  max-width: 100%;
}
</style>
