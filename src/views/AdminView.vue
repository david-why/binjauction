<script setup lang="ts">
import AdminWorkDetail from '@/components/AdminWorkDetail.vue'
import CreateWorkForm from '@/components/CreateWorkForm.vue'
import LoaderIcon from '@/components/LoaderIcon.vue'
import { fetchMe, fetchWorks, me } from '@/service'
import { title } from '@/utils'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

const works = ref<WorkDetail[]>([])

const isLoading = ref(true)
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
  colorChange.addEventListener('change', onColorSchemeChange, { passive: true })
  isLoading.value = true
  await fetchMe()
  await refreshWorks()
  isLoading.value = false
})

onUnmounted(() => {
  colorChange.removeEventListener('change', onColorSchemeChange)
})

watch(
  me,
  (me) => {
    if (me?.role !== 1) {
      router.push('/')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <h1>Admin Panel</h1>
    <h2>Works</h2>
    <div style="margin-block-start: 1em">
      <button @click="exportQrcodes">Export QR Codes</button>
    </div>
    <h3 style="margin-block-start: 1em" v-if="isLoading"><LoaderIcon></LoaderIcon></h3>
    <div v-for="(work, index) in works" :key="work.id">
      <details @toggle="isWorkOpen[work.id] = !isWorkOpen[work.id]" :open="isWorkOpen[work.id]">
        <summary>
          <h3 class="work-title">{{ work.name }}</h3>
        </summary>
        <AdminWorkDetail
          v-model="works[index]"
          :qr-color="qrcodeForeground"
          @refresh="refreshWorks"
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
