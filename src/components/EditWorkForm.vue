<script setup lang="ts">
import { deleteWork, fetchWork, updateWork } from '@/service'
import { onMounted, ref } from 'vue'
import LoaderIcon from './LoaderIcon.vue'
import LoadingButton from './LoadingButton.vue'

const { id } = defineProps<{ id: string }>()

const emit = defineEmits<{
  updated: [Work]
}>()

const work = ref<WorkDetail | null>(null)

const isLoading = ref(true)
const isSaving = ref(false)

async function doUpdateWork() {
  if (!work.value) return
  isSaving.value = true
  try {
    await updateWork(work.value)
    emit('updated', work.value)
  } finally {
    isSaving.value = false
  }
}

async function doDelete() {
  if (!work.value) return
  if (!confirm('Are you sure you want to delete this work?')) return
  isSaving.value = true
  try {
    await deleteWork(work.value.id)
    emit('updated', work.value)
  } finally {
    isSaving.value = false
  }
}

async function doToggleHidden() {
  if (!work.value) return
  work.value.hidden = !work.value.hidden
  await doUpdateWork()
}

onMounted(async () => {
  isLoading.value = true
  work.value = await fetchWork(id)
  isLoading.value = false
})
</script>

<template>
  <div v-if="isLoading"><LoaderIcon></LoaderIcon> Loading...</div>
  <div v-else-if="work">
    <form @submit.prevent="doUpdateWork">
      <table class="update-form">
        <tbody>
          <tr>
            <td>Title</td>
            <td><input type="text" v-model="work.name" /></td>
          </tr>
          <tr>
            <td>Description</td>
            <td><textarea rows="5" v-model="work.description" /></td>
          </tr>
          <tr>
            <td>Minimum Bid</td>
            <td><input type="number" min="10" step="10" v-model="work.minBid" /></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 1em; display: flex; gap: 0.5em">
        <LoadingButton :loading="isSaving" type="submit">Update</LoadingButton>
        <LoadingButton class="danger" :loading="isSaving" @click="doDelete">Delete</LoadingButton>
        <LoadingButton
          :class="{ danger: !work.hidden }"
          :loading="isSaving"
          @click="doToggleHidden"
          >{{ work.hidden ? 'Unhide' : 'Hide' }}</LoadingButton
        >
      </div>
    </form>
  </div>
</template>

<style scoped>
.update-form {
  width: 100%;
}
</style>
