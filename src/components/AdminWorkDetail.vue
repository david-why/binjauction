<script setup lang="ts">
import { getFullLink } from '@/utils'
import { QrcodeCanvas } from 'qrcode.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EditWorkForm from './EditWorkForm.vue'
const router = useRouter()

const { qrColor } = defineProps<{
  qrColor: string
}>()
const work = defineModel<WorkDetail>({ required: true })
const emit = defineEmits<{ refresh: [] }>()

const root = ref<HTMLDivElement>()

const href = getFullLink(router.resolve(`/works/${work.value.id}`).href)

function refreshWorks() {
  emit('refresh')
}

function saveQrCode() {
  if (!root.value) {
    return
  }
  const canvas = root.value.querySelector('canvas')
  if (!canvas) {
    return
  }
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `${work.value.name}.png`
  link.click()
}
</script>

<template>
  <div class="work-details" ref="root">
    <img v-if="work.img" class="work-image" :src="work.img" :alt="work.name" />
    <QrcodeCanvas :value="href" :foreground="qrColor" background="transparent" />
    <button @click="saveQrCode()">Save QR Code</button>
    <EditWorkForm class="edit-form" v-model="work" @refresh="refreshWorks"></EditWorkForm>
  </div>
</template>

<style scoped>
.work-details {
  display: flex;
  flex-direction: column;
  gap: 1em;
  align-items: flex-start;
}
.work-image {
  max-width: 100%;
  max-height: 300px;
}
.edit-form {
  align-self: stretch;
}
</style>
