<script setup lang="ts">
import { deleteBid, fetchBids } from '@/service'
import { onMounted, ref } from 'vue'
import LoaderIcon from './LoaderIcon.vue'

const { work } = defineProps<{ work: WorkDetail }>()

const loading = ref(false)
const bids = ref<BidAdmin[]>([])

async function doDeleteBid(bid: BidAdmin) {
  if (confirm(`Delete bid from ${bid.userName}?`)) {
    await deleteBid(bid.id)
    bids.value = bids.value.filter((b) => b.id !== bid.id)
  }
}

onMounted(async () => {
  loading.value = true
  bids.value = await fetchBids(work.id)
  loading.value = false
})
</script>

<template>
  <div v-if="loading"><LoaderIcon></LoaderIcon></div>
  <!-- <div v-else-if="bids.length === 0">No bids on this work.</div> -->
  <table v-else>
    <thead>
      <tr>
        <th>Name</th>
        <th>Phone</th>
        <th>Bid</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="bid in bids" :key="bid.id">
        <td>{{ bid.userName }}</td>
        <td>{{ bid.phone }}</td>
        <td>¥{{ bid.amount }}</td>
        <td class="bid-actions">
          <button @click="doDeleteBid(bid)">❌</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid black;
  padding: 0.5em;
}
th {
  background-color: #f0f0f0;
}
.bid-actions {
  text-align: center;
}
</style>
