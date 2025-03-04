<template>
  <span class="loader"></span>
</template>

<style scoped>
.loader {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 0.1em solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  vertical-align: baseline;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
