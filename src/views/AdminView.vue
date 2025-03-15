<script setup lang="ts">
import CreateWorkForm from '@/components/CreateWorkForm.vue'
import EditWorkForm from '@/components/EditWorkForm.vue'
import { fetchMe, fetchWorks } from '@/service'
import { getDisplayBid } from '@/utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

const works = ref<WorkDetail[]>([])

const isWorkOpen = ref<Record<string, boolean>>({})

const displayWorks = computed(() =>
  works.value.map((work) => ({
    ...work,
    displayBid: getDisplayBid(work.highestBid),
  })),
)

watch(file, (file) => {
  if (file) {
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }
    imageUrl.value = URL.createObjectURL(file)
  }
})

async function refreshWorks() {
  works.value = await fetchWorks()
}

onMounted(async () => {
  if ((await fetchMe())?.role !== 1) {
    router.push('/login')
  }
  refreshWorks()
})
</script>

<template>
  <div>
    <h1>Admin Panel</h1>
    <h2>Works</h2>
    <div v-for="(work, index) in displayWorks" :key="work.id">
      <details @toggle="isWorkOpen[work.id] = !isWorkOpen[work.id]" :open="isWorkOpen[work.id]">
        <summary>
          <h3 class="work-title">{{ work.name }}</h3>
        </summary>
        <template v-if="isWorkOpen[work.id]">
          <img v-if="work.img" :src="work.img" :alt="work.name" />
          <EditWorkForm v-model="works[index]" @refresh="refreshWorks"></EditWorkForm>
        </template>
      </details>
    </div>
    <h2>Upload work</h2>
    <CreateWorkForm @uploaded="refreshWorks"></CreateWorkForm>
  </div>
</template>

<style scoped>
.work-title {
  display: inline-block;
}
</style>
