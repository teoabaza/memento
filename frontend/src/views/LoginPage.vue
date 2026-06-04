<template>
  <ion-page>
    <ion-content class="ion-padding login-content">
      <div class="login-container">
        <div class="login-header">
          <h1>Memento</h1>
          <p>One line a day</p>
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
  --background: #f8f8f8;
}
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 80px;
}
.login-header {
  text-align: center;
  margin-bottom: 40px;
}
.login-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}
.login-header p {
  color: #888;
  margin-top: 8px;
}
.error {
  color: red;
  text-align: center;
  margin-top: 12px;
}
</style>