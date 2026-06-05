<template>
  <ion-page>
    <ion-content class="ion-padding login-content">
      <div class="login-container">
        <div class="login-header">
          <div class="logo-circle">💭</div>
          <h1>Memento</h1>
          <p>one line a day</p>
        </div>

        <ion-segment v-model="mode" class="ion-margin-bottom">
          <ion-segment-button value="login">Login</ion-segment-button>
          <ion-segment-button value="register">Register</ion-segment-button>
        </ion-segment>

        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input v-model="email" type="email" />
        </ion-item>

        <ion-item class="ion-margin-bottom">
          <ion-label position="floating">Password</ion-label>
          <ion-input v-model="password" type="password" />
        </ion-item>

        <ion-button expand="block" @click="submit" :disabled="loading">
          {{ loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register' }}
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
  --background: #FDF8F3;
}
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 60px;
  padding-bottom: 40px;
}
.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.logo-circle {
  width: 64px;
  height: 64px;
  background: #F5E6D3;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}
.login-header h1 {
  font-size: 26px;
  font-weight: 500;
  color: #2C1810;
  letter-spacing: -0.5px;
  margin: 0;
}
.login-header p {
  color: #A08070;
  margin-top: 4px;
  font-size: 14px;
}
ion-segment {
  --background: #F0E8DF;
  border-radius: 12px;
  margin-bottom: 24px;
}
ion-segment-button {
  --color: #A08070;
  --color-checked: #2C1810;
  --indicator-color: white;
  --border-radius: 10px;
  font-size: 14px;
}
ion-item {
  --background: white;
  --border-radius: 12px;
  --border-color: #E8DDD5;
  --padding-start: 14px;
  margin-bottom: 14px;
  border-radius: 12px;
  border: 0.5px solid #E8DDD5;
}
ion-label {
  color: #A08070 !important;
  font-size: 12px !important;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
ion-button {
  --background: #C4956A;
  --background-hover: #B8845A;
  --border-radius: 14px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-size: 16px;
  margin-top: 8px;
}
.error {
  color: #E24B4A;
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
}
ion-input {
  --color: #2C1810;
  --placeholder-color: #C8B8AC;
}
ion-content {
  --background: #FDF8F3;
  color-scheme: light;
}
</style>