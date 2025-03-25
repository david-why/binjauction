<!-- ToggleButton: a simple toggle -->

<script setup lang="ts">
const checked = defineModel<boolean>({ required: true })

defineProps<{ id?: string }>()
</script>

<template>
  <span>
    <label class="toggle-button">
      <input type="checkbox" v-model="checked" :id="id" />
      <span class="toggle-button__slider"></span>
    </label>
  </span>
</template>

<style scoped>
.toggle-button {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}
.toggle-button input {
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle-button__slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}
.toggle-button__slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
.toggle-button input:checked + .toggle-button__slider {
  background-color: var(--color-accent);
}
.toggle-button input:focus + .toggle-button__slider {
  box-shadow: 0 0 1px var(--color-accent);
}
.toggle-button input:checked + .toggle-button__slider:before {
  transform: translateX(26px);
}
</style>
