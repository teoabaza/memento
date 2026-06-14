<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ formatDate(entry?.date) }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="editing" @click="save" :disabled="loading">Save</ion-button>
          <ion-button v-else @click="editing = true">Edit</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading && !entry" class="loading-state">
        <ion-spinner />
      </div>

      <div v-else-if="entry">
        <!-- Date -->
        <div class="date-row">
          <span class="date-label" v-if="!editing">{{ formatDate(entry.date) }}</span>
          <input v-else type="date" v-model="date" class="date-input" />
        </div>

        <div class="textarea-card">
          <ion-textarea
            v-model="text"
            :readonly="!editing"
            :auto-grow="true"
            class="entry-textarea"
          />
        </div>

        <!-- Images: view strip -->
        <div class="image-strip" v-if="!editing && allPreviews.length">
          <div v-for="(src, i) in allPreviews" :key="i" class="strip-cell">
            <img :src="src" class="strip-img" />
          </div>
        </div>

        <!-- Images: edit grid -->
        <div v-if="editing" class="image-section">
          <div class="image-grid" v-if="allPreviews.length">
            <div v-for="(src, i) in allPreviews" :key="i" class="image-cell">
              <img :src="src" class="image-thumb" />
              <button class="remove-btn" @click="removeImage(i)">✕</button>
            </div>
            <button v-if="allPreviews.length < 5" class="add-cell" @click="pickImages">
              <ion-icon :icon="addOutline" />
            </button>
          </div>
          <button v-else class="add-photo-btn" @click="pickImages">
            <ion-icon :icon="imagesOutline" />
            <span>Add photos</span>
          </button>
          <p class="hint" v-if="allPreviews.length">{{ allPreviews.length }} of 5 photos</p>
        </div>

        <!-- Delete -->
        <div class="delete-section">
          <button class="delete-btn" @click="confirmDelete">
            <ion-icon :icon="trashOutline" />
            Delete entry
          </button>
        </div>

        <p class="error" v-if="error">{{ error }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonBackButton, IonTextarea,
  IonIcon, IonSpinner, alertController
} from '@ionic/vue'
import { imagesOutline, addOutline, trashOutline } from 'ionicons/icons'
import { entriesService } from '../services/api'

const router = useRouter()
const route = useRoute()
const entry = ref<any>(null)
const text = ref('')
const date = ref('')
const existingUrls = ref<string[]>([])
const newFiles = ref<File[]>([])
const newPreviews = ref<string[]>([])
const editing = ref(false)
const loading = ref(false)
const error = ref('')

const allPreviews = computed<string[]>(() => [...existingUrls.value, ...newPreviews.value])

onMounted(async () => {
  loading.value = true
  try {
    entry.value = await entriesService.getOne(route.params.id as string)
    if (entry.value) {
      text.value = entry.value.text
      date.value = entry.value.date ? new Date(entry.value.date).toISOString().slice(0, 10) : ''
      existingUrls.value = Array.isArray(entry.value.imageUrls) ? [...entry.value.imageUrls] : []
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
})

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

function pickImages() {
  const remaining = 5 - allPreviews.value.length
  if (remaining <= 0) return
  const input = document.createElement('input')
  input.type = 'file'; input.accept = 'image/*'; input.multiple = true
  input.onchange = (e: any) => {
    const files: File[] = Array.from(e.target.files || []).slice(0, remaining) as File[]
    files.forEach(file => {
      newFiles.value.push(file)
      const reader = new FileReader()
      reader.onload = (ev: any) => newPreviews.value.push(ev.target.result)
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

function removeImage(index: number) {
  if (index < existingUrls.value.length) {
    existingUrls.value.splice(index, 1)
  } else {
    const ni = index - existingUrls.value.length
    newFiles.value.splice(ni, 1)
    newPreviews.value.splice(ni, 1)
  }
}

async function save() {
  loading.value = true; error.value = ''
  try {
    const uploaded: string[] = []
    for (const file of newFiles.value) uploaded.push(await entriesService.uploadImage(file))
    await entriesService.update(entry.value.id, text.value, [...existingUrls.value, ...uploaded], date.value)
    editing.value = false; newFiles.value = []; newPreviews.value = []
    router.push('/home')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

async function confirmDelete() {
  const alert = await alertController.create({
    header: 'Delete entry',
    message: 'This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', role: 'destructive', handler: async () => {
        await entriesService.delete(entry.value.id)
        router.push('/home')
      }}
    ]
  })
  await alert.present()
}
</script>

<style scoped>
ion-toolbar { --background: #FFFFFF; --border-color: #E4DAD0; }
ion-title { color: #1A2640; font-weight: 500; font-size: 13px; }
ion-back-button { --color: #B87355; }
ion-button { --color: #253350; font-weight: 600; }
ion-content { --background: #f7f1e8; }

.date-row {
  margin-bottom: 14px;
}
.date-label {
  font-size: 11px;
  color: #B87355;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  font-weight: 600;
}
.date-input {
  background: #FFFFFF;
  border: 1px solid #E4DAD0;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  color: #1A2640;
  font-family: inherit;
  outline: none;
  width: 100%;
  box-sizing: border-box;
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
  --padding-start: 18px; --padding-end: 18px;
  --padding-top: 16px; --padding-bottom: 16px;
  --color: #1A2640; --placeholder-color: #C0C8D8;
  font-size: 17px; line-height: 1.7; min-height: 120px;
}
/* View strip */
.image-strip {
  display: flex; gap: 10px; overflow-x: auto;
  padding-bottom: 4px; margin-bottom: 16px;
}
.strip-cell {
  flex-shrink: 0; width: 190px; height: 190px;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(37,51,80,0.08);
}
.strip-img { width: 100%; height: 100%; object-fit: cover; }
/* Edit grid */
.image-section { margin-bottom: 16px; }
.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.image-cell {
  position: relative; aspect-ratio: 1;
  border-radius: 10px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(37,51,80,0.08);
}
.image-thumb { width: 100%; height: 100%; object-fit: cover; }
.remove-btn {
  position: absolute; top: 6px; right: 6px;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(255,255,255,0.92); border: none;
  color: #253350; font-size: 11px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 4px rgba(37,51,80,0.15);
}
.add-cell {
  aspect-ratio: 1; border-radius: 10px;
  border: 1.5px dashed #D4B09A; background: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #B87355; font-size: 24px;
}
.add-photo-btn {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 14px 18px;
  background: #FFFFFF; border: 1.5px dashed #D4B09A;
  border-radius: 16px; color: #B87355; font-size: 15px;
  font-weight: 500; cursor: pointer; font-family: inherit;
  box-shadow: 0 1px 4px rgba(37,51,80,0.04);
}
.add-photo-btn ion-icon { font-size: 20px; }
.hint { font-size: 12px; color: #7A8699; text-align: center; margin-top: 8px; }
.delete-section { margin-top: 8px; padding-top: 20px; border-top: 1px solid #E4DAD0; }
.delete-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; width: 100%; padding: 13px;
  background: transparent; border: 1px solid #B87355;
  border-radius: 10px; font-size: 14px; color: #B87355;
  cursor: pointer; font-family: inherit; font-weight: 500;
}
.error { color: #C0504A; font-size: 14px; margin-top: 12px; }
.loading-state { text-align: center; padding-top: 60px; }
ion-buttons ion-button { --color: #253350 !important; }
</style>
