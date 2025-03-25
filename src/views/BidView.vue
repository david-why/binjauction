<script setup lang="ts">
import LoaderIcon from '@/components/LoaderIcon.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import R2Image from '@/components/R2Image.vue'
import { checkAdmin, fetchConfig, fetchWork, placeBid } from '@/service'
import { getDisplayBid, phone, title, userName } from '@/utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const workId = Number(route.params.id as string)

const bidAmount = ref<number | ''>('')

const isPlacingBid = ref(false)
const loading = ref(true)
const work = ref<WorkDetail | null>(null)
const config = ref<Config | null>(null)

const bidMin = computed(() => {
  if (!work.value) {
    return 100
  }
  if (work.value.highestBid) {
    return work.value.highestBid.amount + 10
  }
  return work.value.minBid
})
const bidMax = computed(() => {
  if (!work.value) {
    return 200
  }
  if (work.value.highestBid) {
    return work.value.highestBid.amount + 100
  }
  return work.value.minBid + 100
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
  if (
    !userName.value ||
    userName.value.length > 100 ||
    ['<', '>', '&', '"', "'"].some((c) => userName.value.includes(c))
  ) {
    alert('Your name is invalid. Please check that you did not use any special characters.')
    return
  }
  if (!/^1[3456789]\d{9}$/.test(phone.value)) {
    alert('Please enter a valid, 11-digit, Chinese phone number.')
    return
  }
  if (confirm(`Place a bid of ¥${bidAmount.value}? You CANNOT take back your bid!`)) {
    isPlacingBid.value = true
    try {
      await placeBid(workId, phone.value, userName.value, bidAmount.value)
    } catch (error) {
      console.error(error)
      alert('Failed to place bid! Someone was probably faster than you...')
    }
    location.reload()
  }
}

onMounted(async () => {
  title.value = ''
  try {
    work.value = await fetchWork(workId)
    config.value = await fetchConfig()
  } catch (e) {
    console.error(e)
    router.push('/')
    return
  }
  if (!work.value) {
    router.push('/')
  }
  if (work.value.hidden && !(await checkAdmin())) {
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
      <R2Image class="work-image" :src="work.img"></R2Image>
    </div>
    <p class="raw-text" v-html="work.description"></p>
    <div>
      <p><strong>Current bid</strong>: {{ displayBid }}</p>
    </div>
    <h2>Place a Bid</h2>
    <p v-if="work.hidden">
      You cannot bid on a hidden work. In fact, only admins can see this work.
    </p>
    <p v-else-if="!config?.allowBid">Bidding is currently disabled. Please check back later.</p>
    <div v-else>
      <p>
        <b>Minimum bid</b>: ¥{{ bidMin }}
        <span v-if="work.highestBid">(at least ¥10 higher than the current highest bid)</span>
      </p>
      <p>
        <b>Maximum bid</b>: ¥{{ bidMax }}
        <span v-if="work.highestBid">(at most ¥100 higher than the current highest bid)</span>
      </p>
      <form @submit.prevent="doPlaceBid">
        <div class="input-form bid-form">
          <div>
            <label for="bidAmount" class="required-label">Your bid</label>
            <input
              id="bidAmount"
              type="number"
              :min="bidMin"
              :max="bidMax"
              autocomplete="off"
              :disabled="isPlacingBid"
              required
              v-model="bidAmount"
            />
          </div>
          <div>
            <label for="phone" class="required-label">Your phone</label>
            <input
              id="phone"
              type="tel"
              autocomplete="tel-national"
              :disabled="isPlacingBid"
              required
              v-model="phone"
            />
          </div>
          <div>
            <div></div>
            <div>
              This phone number is only visible to the organizers. They will contact you if you win
              the auction.
            </div>
          </div>
          <div>
            <label for="name" class="required-label">Your name</label>
            <input
              id="name"
              type="text"
              autocomplete="name"
              :disabled="isPlacingBid"
              required
              v-model="userName"
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
