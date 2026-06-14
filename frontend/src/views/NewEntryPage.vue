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

      <ion-textarea
        v-model="text"
        placeholder="What's on your mind today?"
        :auto-grow="true"
        class="entry-textarea"
      />

      <!-- Image grid -->
      <div class="image-section">
        <div class="image-grid" v-if="previews.length">
          <div
            v-for="(src, i) in previews"
            :key="i"
            class="image-cell"
          >
            <img :src="src" class="image-thumb" />
            <button class="remove-btn" @click="removeImage(i)" aria-label="Remove image">✕</button>
          </div>

          <button
            v-if="previews.length < 5"
            class="add-more-cell"
            @click="pickImages"
          >
            <span class="add-more-icon">+</span>
          </button>
        </div>

        <ion-button v-else fill="outline" expand="block" @click="pickImages" class="add-photo-btn">
          <ion-icon :icon="imagesOutline" slot="start" />
          Add Photos
        </ion-button>
      </div>

      <p class="hint" v-if="previews.length">{{ previews.length }}/5 photos</p>
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
import { imagesOutline } from 'ionicons/icons'
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

function removeImage(index: number) {
  previews.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

async function save() {
  loading.value = true
  error.value = ''
  try {
    const imageUrls: string[] = []
    for (const file of selectedFiles.value) {
      const url = await entriesService.uploadImage(file)
      imageUrls.push(url)
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
  --background: #1C3B2D;
  --border-color: #2A4A3A;
}
ion-title {
  color: #F0EAD6;
  font-weight: 500;
  font-size: 16px;
}
ion-back-button {
  --color: #C9A55A;
}
ion-button {
  --color: #C9A55A;
  font-weight: 600;
}
ion-content {
  --background: #162E24;
}
.today {
  font-size: 11px;
  color: #7BA190;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  font-weight: 500;
}
.entry-textarea {
  --background: #1C3B2D;
  --border-radius: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --color: #F0EAD6;
  --placeholder-color: #4A6A5A;
  border: 0.5px solid #2A4A3A;
  border-radius: 16px;
  font-size: 16px;
  line-height: 1.65;
  min-height: 140px;
}
.image-section {
  margin-top: 20px;
}
.add-photo-btn {
  --color: #C9A55A;
  --border-color: #C9A55A;
  --border-style: dashed;
  --border-radius: 14px;
  --border-width: 1px;
}
/* Image grid */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.image-cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
}
.image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(22, 46, 36, 0.85);
  border: none;
  color: #F0EAD6;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.add-more-cell {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1px dashed #C9A55A;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.add-more-icon {
  font-size: 28px;
  color: #C9A55A;
  line-height: 1;
}
.hint {
  font-size: 12px;
  color: #7BA190;
  margin-top: 10px;
  text-align: center;
}
.error {
  color: #E05C5C;
  margin-top: 12px;
  font-size: 14px;
}
ion-buttons ion-button {
  --color: #C9A55A !important;
}
</style>
