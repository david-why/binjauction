<script setup lang="ts">
import AdminWorkDetail from '@/components/AdminWorkDetail.vue'
import CreateWorkForm from '@/components/CreateWorkForm.vue'
import { fetchMe, fetchWorks } from '@/service'
import { title } from '@/utils'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

const works = ref<WorkDetail[]>([])

const isWorkOpen = ref<Record<string, boolean>>({})

const colorChange = matchMedia('(prefers-color-scheme: dark)')
const colorMode = ref(colorChange.matches ? 'dark' : 'light')
const qrcodeForeground = computed(() => (colorMode.value === 'dark' ? 'white' : 'black'))

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

function exportQrcodes() {
  router.push('/admin/qr')
}

function onColorSchemeChange(e: MediaQueryListEvent) {
  colorMode.value = e.matches ? 'dark' : 'light'
}

onMounted(async () => {
  title.value = 'Admin'
  if ((await fetchMe())?.role !== 1) {
    router.push('/login')
  }
  refreshWorks()
  colorChange.addEventListener('change', onColorSchemeChange, { passive: true })
})

onUnmounted(() => {
  colorChange.removeEventListener('change', onColorSchemeChange)
})
</script>

<template>
  <div>
    <h1>Admin Panel</h1>
    <h2>Works</h2>
    <div style="margin-block-start: 1em">
      <button @click="exportQrcodes">Export QR Codes</button>
    </div>
    <div v-for="(work, index) in works" :key="work.id">
      <details @toggle="isWorkOpen[work.id] = !isWorkOpen[work.id]" :open="isWorkOpen[work.id]">
        <summary>
          <h3 class="work-title">{{ work.name }}</h3>
        </summary>
        <AdminWorkDetail
          v-model="works[index]"
          :qr-color="qrcodeForeground"
          v-if="isWorkOpen[work.id]"
        ></AdminWorkDetail>
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
