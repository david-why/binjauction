import { computed } from 'vue'

export const loginRedirectPath = computed({
  get: () => localStorage.getItem('loginRedirectPath'),
  set: (value) => {
    if (value) {
      localStorage.setItem('loginRedirectPath', value);
    }
  },
})
