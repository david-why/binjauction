<script setup lang="ts">
import LoadingButton from '@/components/LoadingButton.vue'
import { fetchMe, login, verify } from '@/service'
import { loginRedirectPath } from '@/store'
import { title } from '@/utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const phone = ref('')
const code = ref('')
let sessionToken: string | null = null

const phoneEdited = ref(false)
watch(phone, () => (phoneEdited.value = true))
const isCodeSent = ref(false)
const isCodeSending = ref(false)
const isVerifying = ref(false)

const isSendDisabled = computed(
  () => !phone.value || phoneError.value || isCodeSent.value || isCodeSending.value,
)
const isVerifyDisabled = computed(() => !code.value || codeError.value || isVerifying.value)

const phoneErrorMsg = computed(() => {
  if (!phoneEdited.value) {
    return null
  }
  if (!phone.value) {
    return 'Phone number is required'
  }
  if (!/^1[3456789]\d{9}$/.test(phone.value)) {
    return 'Invalid phone number'
  }
  return null
})
const phoneError = computed(() => !!phoneErrorMsg.value)

const codeErrorMsg = computed(() => {
  if (!code.value) {
    return 'SMS code is required'
  }
  if (!/^\d{6}$/.test(code.value)) {
    return 'SMS code should be a 6 digit number'
  }
  return null
})
const codeError = computed(() => !!codeErrorMsg.value)

async function sendCode() {
  isCodeSending.value = true
  try {
    sessionToken = await login(phone.value)
    isCodeSent.value = true
  } catch (error) {
    console.error(error)
    alert('Failed to send SMS code')
  }
  isCodeSending.value = false
}

async function submitCode() {
  if (!sessionToken) {
    return
  }
  isVerifying.value = true
  await verify(sessionToken, code.value)
  router.push(loginRedirectPath.value ?? '/')
}

onMounted(async () => {
  title.value = 'Login'
  if (await fetchMe()) {
    router.push(loginRedirectPath.value ?? '/')
  }
})
</script>

<template>
  <h1>Login</h1>
  <form @submit.prevent="submitCode">
    <table class="login-form">
      <tbody>
        <tr :class="{ 'form-error': phoneError }">
          <td colspan="2">
            <input type="tel" placeholder="Phone number (+86)" required v-model="phone" />
          </td>
        </tr>
        <tr class="form-error">
          <td colspan="2">{{ phoneErrorMsg }}</td>
        </tr>
        <tr>
          <td>
            <input type="text" placeholder="SMS code" required v-model="code" />
          </td>
          <td>
            <LoadingButton
              class="send-button"
              :loading="isCodeSending"
              :disabled="isSendDisabled"
              @click="sendCode"
              >Send</LoadingButton
            >
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <LoadingButton
              class="login-button"
              type="submit"
              :loading="isVerifying"
              :disabled="isVerifyDisabled"
              >Login</LoadingButton
            >
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<style scoped>
.login-form {
  width: 100%;
  max-width: 500px;
  border-collapse: collapse;
}
.login-form input,
.login-button {
  width: 100%;
  margin: 8px 0;
}
.send-button {
  width: 100%;
}
.form-error {
  color: red;
}
.form-error input {
  border-color: red;
}
</style>
