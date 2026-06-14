<template>
  <ion-page>
    <ion-content class="login-content">
      <div class="login-container">

        <div class="login-header">
          <div class="logo-wrap">
            <img src="/logo.png" alt="Memento" class="logo-img" />
          </div>
          <h1>Memento</h1>
          <p>one line a day</p>
        </div>

        <ion-segment v-model="mode" class="mode-segment">
          <ion-segment-button value="login">Login</ion-segment-button>
          <ion-segment-button value="register">Register</ion-segment-button>
        </ion-segment>

        <div class="form-fields">
          <div class="field-wrap">
            <label class="field-label">Email</label>
            <ion-input v-model="email" type="email" autocomplete="email" class="field-input" />
          </div>
          <div class="field-wrap">
            <label class="field-label">Password</label>
            <ion-input v-model="password" type="password" autocomplete="current-password" class="field-input" />
          </div>
        </div>

        <ion-button expand="block" class="submit-btn" @click="submit" :disabled="loading">
          {{ loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account' }}
        </ion-button>

        <p class="error" v-if="error">{{ error }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonInput,
  IonButton, IonSegment, IonSegmentButton
} from '@ionic/vue'
import { authService } from '../services/api'

const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await authService.login(email.value, password.value)
    } else {
      await authService.register(email.value, password.value)
    }
    router.push('/home')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-content {
  --background: #f7f1e8;
}
.login-container {
  max-width: 380px;
  margin: 0 auto;
  padding: 72px 28px 48px;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 44px;
}
.logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: -10px;
}
.logo-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
.login-header h1 {
  font-size: 30px;
  font-weight: 300;
  color: #253350;
  letter-spacing: 2px;
  margin: 0 0 4px;
  font-family: Georgia, 'Times New Roman', serif;
}
.login-header p {
  color: #7A8699;
  font-size: 13px;
  letter-spacing: 0.5px;
  margin: 0;
}

/* Segment */
.mode-segment {
  --background: #EDE5DA;
  border-radius: 12px;
  margin-bottom: 28px;
  overflow: hidden;
}
ion-segment-button {
  --color: #7A8699;
  --color-checked: #253350;
  --indicator-color: #FFFFFF;
  --border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  --padding-top: 10px;
  --padding-bottom: 10px;
}

/* Form */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 22px;
}
.field-wrap {
  background: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E4DAD0;
  padding: 10px 16px 12px;
  box-shadow: 0 1px 4px rgba(37,51,80,0.05);
}
.field-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #7A8699;
  margin-bottom: 4px;
}
.field-input {
  --color: #1A2640;
  --placeholder-color: #C0C8D8;
  --padding-start: 0;
  --padding-end: 0;
  font-size: 16px;
}

/* Submit */
.submit-btn {
  --background: #253350;
  --background-hover: #3A4F72;
  --background-activated: #1C2A45;
  --color: #FFFFFF;
  --border-radius: 10px;
  --padding-top: 17px;
  --padding-bottom: 17px;
  --box-shadow: 0 4px 14px rgba(37,51,80,0.25);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.error {
  color: #C0504A;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}
</style>
