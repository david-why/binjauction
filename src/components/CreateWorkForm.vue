<script setup lang="ts">
import { createWork, upload } from '@/service'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  uploaded: [string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const file = ref<File | null>(null)
const imageUrl = ref<string | null>(null)
watch(file, (file, oldFile) => {
  if (file) {
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }
    imageUrl.value = URL.createObjectURL(file)
    if (!name.value || name.value === oldFile?.name) {
      name.value = file.name
    }
  }
})

const name = ref('')
const description = ref('')
const minBid = ref(100)

const isUploading = ref(false)
const isDragOver = ref(false)

function onDragOver(event: DragEvent) {
  const dt = event.dataTransfer
  if (dt) {
    dt.dropEffect = 'copy'
    isDragOver.value = true
  }
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(event: DragEvent) {
  const droppedFile = event.dataTransfer?.files?.[0]
  if (droppedFile && droppedFile.type.startsWith('image/')) {
    file.value = droppedFile
  }
}

function fileChanged() {
  const selFile = fileInput.value?.files?.[0]
  if (selFile && selFile.type.startsWith('image/')) {
    file.value = selFile
  }
}

async function doUploadWork() {
  if (!file.value) {
    return
  }
  isUploading.value = true
  try {
    const { url } = await upload(file.value)
    const id = await createWork({
      name: name.value,
      description: description.value,
      minBid: minBid.value,
      img: url,
    })
    emit('uploaded', id)
  } catch (e) {
    console.error(e)
    alert('Failed to upload work. Please try again.')
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <form @submit="doUploadWork">
    <input type="file" @change="fileChanged" accept="image/*" ref="fileInput" hidden />
    <div
      class="drop-area"
      :class="{ 'dragged-over': isDragOver }"
      @click="fileInput?.click"
      @dragenter.prevent="onDragOver"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @mouseleave.passive="onDragLeave"
      @drop.prevent="onDrop"
    >
      <p>Drop image here or click to upload</p>
    </div>
    <div v-if="file">
      <h3>{{ file.name }}</h3>
      <img v-if="imageUrl" :src="imageUrl" class="image-preview" />
      <div class="upload-form">
        <div>
          <label for="name">Title</label>
          <input id="name" type="text" v-model="name" />
        </div>
        <div>
          <label for="description">Description</label>
          <textarea id="description" rows="5" v-model="description"></textarea>
        </div>
        <div>
          <label for="minBid">Minimum Bid</label>
          <input id="minBid" type="number" min="10" step="10" v-model="minBid" />
        </div>
      </div>
      <div style="margin-top: 1em">
        <button type="submit" :disabled="isUploading">Create work</button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.upload-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.upload-form > div {
  display: flex;
  align-items: center;
}
.upload-form > div > :nth-child(1) {
  flex: 0 0 110px;
}
.upload-form > div > :nth-child(2) {
  flex: 1 0 0;
}
.drop-area {
  display: inline-block;
  padding: 50px 50px;
  width: 100%;
  max-width: 100%;
  border: 2px dashed var(--color-contrast);
  border-radius: 0.5em;
  text-align: center;
  background-color: var(--color-background-mute);
  transition:
    border-color 0.2s,
    color 0.2s;
  cursor: pointer;
  margin: 1em 0;
}
.drop-area:hover,
.drop-area.dragged-over {
  border-color: var(--color-accent);
}
.image-preview {
  max-width: 100%;
  border: 1px solid var(--color-background-mute);
  border-radius: 0.5em;
  background-color: var(--color-background-mute);
  padding: 1em;
}
</style>
