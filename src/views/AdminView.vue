<script setup lang="ts">
import CreateWorkForm from '@/components/CreateWorkForm.vue'
import { fetchWorks, me } from '@/service'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

const works = ref<WorkDetail[]>([])

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

onMounted(() => {
  if (me.value?.role !== 1) {
    router.push('/login')
  }
  refreshWorks()
})
</script>

<template>
  <div>
    <h1>Admin Panel</h1>
    <h2>Works</h2>
    <div v-for="work in works" :key="work.id">
      <!-- <router-link :to="'/works/' + work.id">
        <p>{{ work.name }}</p>
      </router-link> -->
      <details>
        <summary>{{ work.name }}</summary>
        <p>{{ work.description }}</p>
        <p>{{ work.highestBid?.amount || 'No bid yet' }}</p>
      </details>
    </div>
    <h2>Upload work</h2>
    <CreateWorkForm @uploaded="refreshWorks"></CreateWorkForm>
  </div>
</template>

<style scoped></style>
