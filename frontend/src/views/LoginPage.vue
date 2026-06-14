<template>
  <ion-page>
    <ion-content class="login-content">
      <div class="login-container">

        <div class="login-header">
          <!-- Pen-nib logo matching the new brand mark -->
          <div class="logo-wrap">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
              <rect width="100" height="100" rx="24" fill="#1C3B2D"/>
              <!-- Pen barrel -->
              <rect x="43" y="10" width="14" height="20" rx="4"
                    fill="none" stroke="#C9A55A" stroke-width="2.5"/>
              <!-- Clip / cap line -->
              <line x1="50" y1="10" x2="50" y2="30"
                    stroke="#C9A55A" stroke-width="1.5" stroke-dasharray="2 2"/>
              <!-- Nib body -->
              <path d="M37 30 L50 72 L63 30 Z"
                    fill="none" stroke="#C9A55A" stroke-width="2.5" stroke-linejoin="round"/>
              <!-- Nib centre line -->
              <line x1="50" y1="30" x2="50" y2="72"
                    stroke="#C9A55A" stroke-width="1.2" stroke-dasharray="0"/>
              <!-- Ink hole -->
              <circle cx="50" cy="58" r="3.5"
                      fill="none" stroke="#C9A55A" stroke-width="2"/>
              <!-- Signature stroke -->
              <path d="M32 84 Q41 79 50 82 Q59 85 68 80"
                    fill="none" stroke="#C9A55A" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1>Memento</h1>
          <p>one line a day</p>
        </div>

        <ion-segment v-model="mode" class="mode-segment">
          <ion-segment-button value="login">Login</ion-segment-button>
          <ion-segment-button value="register">Register</ion-segment-button>
        </ion-segment>

        <div class="form-fields">
          <ion-item class="field-item">
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email" autocomplete="email" />
          </ion-item>

          <ion-item class="field-item">
            <ion-label position="floating">Password</ion-label>
            <ion-input v-model="password" type="password" autocomplete="current-password" />
          </ion-item>
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
  IonPage, IonContent, IonItem, IonLabel, IonInput,
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
  --background: #162E24;
}
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 60px 24px 40px;
}
.login-header {
  text-align: center;
  margin-bottom: 40px;
}
.logo-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.logo-svg {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  filter: drop-shadow(0 4px 16px rgba(201, 165, 90, 0.25));
}
.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #F0EAD6;
  letter-spacing: -0.5px;
  margin: 0;
}
.login-header p {
  color: #7BA190;
  margin-top: 4px;
  font-size: 14px;
  letter-spacing: 0.3px;
}
.mode-segment {
  --background: #1C3B2D;
  border-radius: 14px;
  margin-bottom: 24px;
  border: 0.5px solid #2A4A3A;
}
ion-segment-button {
  --color: #7BA190;
  --color-checked: #F0EAD6;
  --indicator-color: #C9A55A;
  --border-radius: 12px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
}
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}
.field-item {
  --background: #1C3B2D;
  --border-radius: 14px;
  --border-color: #2A4A3A;
  --padding-start: 16px;
  --color: #F0EAD6;
  border-radius: 14px;
  border: 0.5px solid #2A4A3A;
}
ion-label {
  color: #7BA190 !important;
  font-size: 11px !important;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
ion-input {
  --color: #F0EAD6;
  --placeholder-color: #4A6A5A;
}
.submit-btn {
  --background: #C9A55A;
  --background-hover: #D8B870;
  --color: #162E24;
  --border-radius: 14px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
}
.error {
  color: #E05C5C;
  text-align: center;
  margin-top: 14px;
  font-size: 14px;
}
</style>
