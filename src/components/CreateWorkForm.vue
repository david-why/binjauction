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

function onDrop(event: DragEvent) {
  event.preventDefault()
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
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <form @submit="doUploadWork">
    <input type="file" @change="fileChanged" accept="image/*" ref="fileInput" hidden />
    <div class="drop-area" @click="fileInput?.click" @dragover.prevent @drop="onDrop">
      <p>Drop image here or click to upload</p>
    </div>
    <div v-if="file">
      <h3>{{ file.name }}</h3>
      <img v-if="imageUrl" :src="imageUrl" class="image-preview" />
      <table class="upload-form">
        <tbody>
          <tr>
            <td>Title</td>
            <td><input type="text" v-model="name" /></td>
          </tr>
          <tr>
            <td>Description</td>
            <td><textarea rows="5" v-model="description" /></td>
          </tr>
          <tr>
            <td>Minimum Bid</td>
            <td><input type="number" min="10" step="10" v-model="minBid" /></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 1em">
        <button type="submit" :disabled="isUploading">Create work</button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.upload-form {
  width: 100%;
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
.drop-area:hover {
  border-color: var(--color-accent);
  /* color: var(--color-accent-hover); */
  /* color: var(--color-contrast); */
}
.image-preview {
  max-width: 100%;
  border: 1px solid var(--color-background-mute);
  border-radius: 0.5em;
  background-color: var(--color-background-mute);
  padding: 1em;
}
</style>
