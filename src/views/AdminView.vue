<script setup lang="ts">
import AdminWorkDetail from '@/components/AdminWorkDetail.vue'
import CreateWorkForm from '@/components/CreateWorkForm.vue'
import LoaderIcon from '@/components/LoaderIcon.vue'
import { checkAdmin, fetchWorks } from '@/service'
import { accessToken, title } from '@/utils'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

const works = ref<WorkDetail[]>([])

const isValidToken = ref(false)
const isLoading = ref(false)
const isWorkOpen = ref<Record<string, boolean>>({})
watch(accessToken, () => (isValidToken.value = false))

watch(file, (file) => {
  if (file) {
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }
    imageUrl.value = URL.createObjectURL(file)
  }
})

async function checkRefreshWorks(doAlert: boolean = true) {
  isLoading.value = true
  if (!(await checkAdmin())) {
    if (doAlert) {
      alert('Incorrect passphrase. Please try again.')
    }
    isLoading.value = false
    return
  }
  isValidToken.value = true
  await refreshWorks()
}

async function refreshWorks() {
  isLoading.value = true
  try {
    works.value = await fetchWorks()
  } finally {
    isLoading.value = false
  }
}

function exportQrcodes() {
  router.push('/admin/qr')
}

onMounted(() => {
  title.value = 'Admin'
  if (accessToken.value) {
    checkRefreshWorks(false)
  }
})
</script>

<template>
  <div>
    <h1>Admin Panel</h1>
    <form v-if="!isValidToken" @submit.prevent="checkRefreshWorks()">
      <div class="input-form">
        <div>
          <label for="accessToken">Passphrase</label>
          <input id="accessToken" type="password" v-model="accessToken" />
        </div>
      </div>
      <div style="margin-top: 1em">
        <button type="submit" :disabled="isLoading">Check token</button>
      </div>
    </form>
    <div v-if="isValidToken">
      <h2>Works</h2>
      <div style="margin-block-start: 1em">
        <button @click="exportQrcodes">Export QR Codes</button>
      </div>
      <div style="margin-block-start: 1em" v-if="isLoading"><LoaderIcon></LoaderIcon></div>
      <div v-for="(work, index) in works" :key="work.id">
        <details @toggle="isWorkOpen[work.id] = !isWorkOpen[work.id]" :open="isWorkOpen[work.id]">
          <summary>
            <h3 class="work-title">{{ work.name }}</h3>
          </summary>
          <AdminWorkDetail
            v-model="works[index]"
            @refresh="refreshWorks"
            v-if="isWorkOpen[work.id]"
          ></AdminWorkDetail>
        </details>
      </div>
      <h2>Upload work</h2>
      <CreateWorkForm @uploaded="refreshWorks"></CreateWorkForm>
    </div>
  </div>
</template>

<style scoped>
.work-title {
  display: inline-block;
}
</style>
