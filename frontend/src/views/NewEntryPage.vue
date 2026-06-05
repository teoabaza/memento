<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="save" :disabled="loading || !text">
            Save
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="today">{{ today }}</p>

      <ion-textarea
        v-model="text"
        placeholder="What's on your mind today?"
        :auto-grow="true"
        class="entry-textarea"
      />

      <div class="image-section">
        <ion-button fill="outline" expand="block" @click="pickImage">
          <ion-icon :icon="image" slot="start" />
          {{ selectedImage ? 'Change Photo' : 'Add Photo' }}
        </ion-button>

        <div v-if="selectedImage" class="image-preview">
          <img :src="selectedImage" />
        </div>
      </div>

      <p class="error" v-if="error">{{ error }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonBackButton, IonTextarea, IonIcon
} from '@ionic/vue'
import { image } from 'ionicons/icons'
import { entriesService } from '../services/api'

const router = useRouter()
const text = ref('')
const selectedImage = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const loading = ref(false)
const error = ref('')

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

function pickImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      selectedFile.value = file
      const reader = new FileReader()
      reader.onload = (ev: any) => {
        selectedImage.value = ev.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

async function save() {
  loading.value = true
  error.value = ''
  try {
    let imageUrl: string | undefined
    if (selectedFile.value) {
      imageUrl = await entriesService.uploadImage(selectedFile.value)
    }
    await entriesService.create(text.value, imageUrl)
    router.push('/home')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
ion-toolbar {
  --background: #FDF8F3;
  --border-color: #EDE5DC;
}
ion-title {
  color: #2C1810;
  font-weight: 500;
  font-size: 16px;
}
ion-back-button {
  --color: #C4956A;
}
ion-button {
  --color: #C4956A;
  font-weight: 500;
}
ion-content {
  --background: #FDF8F3;
}
.today {
  font-size: 11px;
  color: #A08070;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  font-weight: 500;
}
.entry-textarea {
  --background: white;
  --border-radius: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  border: 0.5px solid #EDE5DC;
  border-radius: 16px;
  font-size: 16px;
  color: #2C1810;
  line-height: 1.6;
  min-height: 140px;
}
.image-section {
  margin-top: 16px;
}
ion-button[fill="outline"] {
  --color: #C4956A;
  --border-color: #C4956A;
  --border-style: dashed;
  --border-radius: 14px;
  --border-width: 0.5px;
}
.image-preview {
  margin-top: 14px;
  border-radius: 16px;
  overflow: hidden;
}
.image-preview img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
}
.error {
  color: #E24B4A;
  margin-top: 12px;
  font-size: 14px;
}
ion-buttons ion-button {
  --color: #A08070 !important;
}
</style>