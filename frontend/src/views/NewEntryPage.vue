<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="save" :disabled="loading || !text.trim()">Save</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="today">{{ today }}</p>

      <div class="textarea-card">
        <ion-textarea
          v-model="text"
          placeholder="What's on your mind today?"
          :auto-grow="true"
          class="entry-textarea"
        />
      </div>

      <!-- Image section -->
      <div class="image-section">
        <div class="image-grid" v-if="previews.length">
          <div v-for="(src, i) in previews" :key="i" class="image-cell">
            <img :src="src" class="image-thumb" />
            <button class="remove-btn" @click="removeImage(i)">✕</button>
          </div>
          <button v-if="previews.length < 5" class="add-cell" @click="pickImages">
            <ion-icon :icon="addOutline" />
          </button>
        </div>

        <button v-else class="add-photo-btn" @click="pickImages">
          <ion-icon :icon="imagesOutline" />
          <span>Add photos</span>
        </button>
      </div>

      <p class="hint" v-if="previews.length">{{ previews.length }} of 5 photos</p>
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
import { imagesOutline, addOutline } from 'ionicons/icons'
import { entriesService } from '../services/api'

const router = useRouter()
const text = ref('')
const previews = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const loading = ref(false)
const error = ref('')

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

function pickImages() {
  const remaining = 5 - selectedFiles.value.length
  if (remaining <= 0) return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = (e: any) => {
    const files: File[] = Array.from(e.target.files || []).slice(0, remaining) as File[]
    files.forEach(file => {
      selectedFiles.value.push(file)
      const reader = new FileReader()
      reader.onload = (ev: any) => previews.value.push(ev.target.result)
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

function removeImage(i: number) {
  previews.value.splice(i, 1)
  selectedFiles.value.splice(i, 1)
}

async function save() {
  loading.value = true
  error.value = ''
  try {
    const imageUrls: string[] = []
    for (const file of selectedFiles.value) {
      imageUrls.push(await entriesService.uploadImage(file))
    }
    await entriesService.create(text.value, imageUrls)
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
  --background: #FFFFFF;
  --border-color: #E4DAD0;
}
ion-title { color: #1A2640; font-size: 16px; font-weight: 500; }
ion-back-button { --color: #B87355; }
ion-button { --color: #253350; font-weight: 600; }
ion-content { --background: #f7f1e8; }

.today {
  font-size: 11px;
  color: #B87355;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  font-weight: 600;
  margin: 0 0 14px;
}
.textarea-card {
  background: #FFFFFF;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(37,51,80,0.07);
  overflow: hidden;
  margin-bottom: 16px;
}
.entry-textarea {
  --background: transparent;
  --padding-start: 18px;
  --padding-end: 18px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --color: #1A2640;
  --placeholder-color: #C0C8D8;
  font-size: 16px;
  line-height: 1.65;
  min-height: 140px;
}
.image-section { margin-top: 4px; }
.add-photo-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px 18px;
  background: #FFFFFF;
  border: 1.5px dashed #D4B09A;
  border-radius: 16px;
  color: #B87355;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 1px 4px rgba(37,51,80,0.04);
}
.add-photo-btn ion-icon { font-size: 20px; }
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.image-cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(37,51,80,0.08);
}
.image-thumb { width: 100%; height: 100%; object-fit: cover; }
.remove-btn {
  position: absolute;
  top: 6px; right: 6px;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  color: #253350;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(37,51,80,0.15);
}
.add-cell {
  aspect-ratio: 1;
  border-radius: 10px;
  border: 1.5px dashed #D4B09A;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #B87355;
  font-size: 24px;
}
.hint { font-size: 12px; color: #7A8699; text-align: center; margin-top: 10px; }
.error { color: #C0504A; font-size: 14px; margin-top: 12px; }
ion-buttons ion-button { --color: #253350 !important; }
</style>
