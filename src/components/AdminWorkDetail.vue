<script setup lang="ts">
import { ref } from 'vue'
import EditWorkForm from './EditWorkForm.vue'
import R2Image from './R2Image.vue'

const work = defineModel<WorkDetail>({ required: true })
const emit = defineEmits<{ refresh: [] }>()

const root = ref<HTMLDivElement>()

function refreshWorks() {
  emit('refresh')
}
</script>

<template>
  <div class="work-details" ref="root">
    <R2Image v-if="work.img" class="work-image" :src="work.img" :alt="work.name"></R2Image>
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
