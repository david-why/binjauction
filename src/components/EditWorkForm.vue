<script setup lang="ts">
import { deleteWork, updateWork } from '@/service'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import LoadingButton from './LoadingButton.vue'

const emit = defineEmits<{ refresh: [] }>()

const work = defineModel<WorkDetail>({ required: true })

const isEdited = ref(false)
const isSaving = ref(false)

watch(work, () => (isEdited.value = true), { deep: true })
watch(isEdited, (value) => {
  if (value) {
    window.addEventListener('beforeunload', handleBeforeUnload)
  } else {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

async function doUpdateWork() {
  if (!work.value) return
  isSaving.value = true
  try {
    await updateWork(work.value)
    isEdited.value = false
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
    isEdited.value = false
    emit('refresh')
  } finally {
    isSaving.value = false
  }
}

async function doToggleHidden() {
  if (!work.value) return
  work.value.hidden = !work.value.hidden
  await doUpdateWork()
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault()
  event.returnValue = true
}

onMounted(() => {
  isEdited.value = false
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <form @submit.prevent="doUpdateWork">
    <div class="update-form">
      <div>
        <label for="name">Title</label>
        <input id="name" type="text" v-model="work.name" />
      </div>
      <div>
        <label for="description">Description</label>
        <textarea id="description" rows="5" v-model="work.description"></textarea>
      </div>
      <div>
        <label for="minBid">Minimum Bid</label>
        <input id="minBid" type="number" min="10" step="10" v-model="work.minBid" />
      </div>
    </div>
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
</template>

<style scoped>
.update-form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.update-form > div {
  display: flex;
  align-items: center;
}
.update-form > div > :nth-child(1) {
  flex: 0 0 110px;
}
.update-form > div > :nth-child(2) {
  flex: 1 0 0;
}
</style>
