<script setup lang="ts">
import LoaderIcon from './LoaderIcon.vue'

withDefaults(
  defineProps<{
    loading: boolean
    disabled?: boolean
    type?: typeof HTMLButtonElement.prototype.type
  }>(),
  {
    disabled: false,
  },
)

defineEmits<{
  click: [MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="loading || disabled"
    class="loading-button"
    @click="$emit('click', $event)"
  >
    <span class="loader-container" v-if="loading"><LoaderIcon /></span>
    <span><slot></slot></span>
  </button>
</template>

<style scoped>
.loading-button > * {
  vertical-align: middle;
}
.loading-button:disabled {
  cursor: not-allowed;
}
.loader-container {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
}
</style>
