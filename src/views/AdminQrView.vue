<script setup lang="ts">
import { fetchWorks } from '@/service'
import { getFullLink, title } from '@/utils'
import { QrcodeCanvas } from 'qrcode.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const works = ref<WorkDetail[]>([])

const displayWorks = computed(() =>
  works.value.map((work) => ({
    ...work,
    href: getFullLink(router.resolve(`/works/${work.id}`).href),
  })),
)

function doPrint() {
  window.print()
}

function downloadQr(work: WorkDetail, event: Event) {
  const canvas = event.target as HTMLCanvasElement
  const link = document.createElement('a')
  link.download = `${work.name}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(async () => {
  title.value = 'Export QR Codes'
  works.value = await fetchWorks()
})
</script>

<template>
  <div class="qr-description">
    <h1>Export QR Codes</h1>
    <p>
      You can print this page for the QR codes for all works, or click on individual QR codes to
      download them.
    </p>
    <button @click="doPrint">Print</button>
  </div>
  <div class="qr-grid">
    <div class="qr-work" v-for="work in displayWorks" :key="work.id">
      <span @click="downloadQr(work, $event)" style="cursor: pointer">
        <QrcodeCanvas class="qr-canvas" :value="work.href" />
      </span>
      <div>{{ work.name }}</div>
    </div>
  </div>
</template>

<style scoped>
.qr-description {
  padding-bottom: 1em;
  border-bottom: 1px solid var(--color-background-mute);
}
@media print {
  .qr-description {
    display: none;
  }
}
.qr-grid {
  display: table;
  gap: 1em;
}
.qr-work {
  display: inline-block;
  vertical-align: top;
  width: 200px;
  text-align: center;
  page-break-inside: avoid;
  break-inside: avoid;
  padding: 1em;
}
:deep(.qr-canvas) {
  margin-bottom: 1em;
}
</style>

<style>
@media print {
  .navbar {
    display: none !important;
  }
  main {
    border: 0 !important;
  }
}
</style>
