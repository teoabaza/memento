<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ formatDate(entry?.date) }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="save" :disabled="loading" v-if="editing">Save</ion-button>
          <ion-button @click="editing = true" v-else>Edit</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="loading-state">
        <ion-spinner color="medium" />
      </div>

      <div v-else-if="entry">
        <ion-textarea
          v-model="text"
          :readonly="!editing"
          :auto-grow="true"
          class="entry-textarea"
        />

        <!-- Image display / edit area -->
        <div class="image-section" v-if="allPreviews.length || editing">

          <!-- Scrollable image strip (view mode) -->
          <div v-if="!editing && allPreviews.length" class="image-strip">
            <div v-for="(src, i) in allPreviews" :key="i" class="strip-cell">
              <img :src="src" class="strip-img" />
            </div>
          </div>

          <!-- Editable grid (edit mode) -->
          <div v-if="editing" class="image-grid">
            <div v-for="(src, i) in allPreviews" :key="i" class="image-cell">
              <img :src="src" class="image-thumb" />
              <button class="remove-btn" @click="removeImage(i)" aria-label="Remove">✕</button>
            </div>
            <button
              v-if="allPreviews.length < 5"
              class="add-more-cell"
              @click="pickImages"
            >
              <span class="add-more-icon">+</span>
            </button>
          </div>

          <p class="hint" v-if="editing && allPreviews.length">
            {{ allPreviews.length }}/5 photos
          </p>
        </div>

        <!-- Add photo button when editing and no images yet -->
        <div v-if="editing && allPreviews.length === 0" class="image-section">
          <ion-button fill="outline" expand="block" @click="pickImages" class="add-photo-btn">
            <ion-icon :icon="imagesOutline" slot="start" />
            Add Photos
          </ion-button>
        </div>

        <!-- Delete entry -->
        <div class="delete-section">
          <button class="delete-btn" @click="confirmDelete">
            <ion-icon :icon="trashOutline" />
            Delete Entry
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
import { entriesService } from '../services/api'
import { imagesOutline, trashOutline } from 'ionicons/icons'

const router = useRouter()
const route = useRoute()
const entry = ref<any>(null)
const text = ref('')

// Existing URLs kept from server (can be removed by user)
const existingUrls = ref<string[]>([])
// New files the user just picked
const newFiles = ref<File[]>([])
const newPreviews = ref<string[]>([])

const editing = ref(false)
const loading = ref(false)
const error = ref('')

// Combined list of previews (existing + newly picked)
const allPreviews = computed<string[]>(() => [...existingUrls.value, ...newPreviews.value])

onMounted(async () => {
  loading.value = true
  try {
    entry.value = await entriesService.getOne(route.params.id as string)
    if (entry.value) {
      text.value = entry.value.text
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
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
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
    // Removing an already-saved image
    existingUrls.value.splice(index, 1)
  } else {
    // Removing a newly picked image
    const newIndex = index - existingUrls.value.length
    newFiles.value.splice(newIndex, 1)
    newPreviews.value.splice(newIndex, 1)
  }
}

async function save() {
  loading.value = true
  error.value = ''
  try {
    // Upload any new files
    const uploadedUrls: string[] = []
    for (const file of newFiles.value) {
      const url = await entriesService.uploadImage(file)
      uploadedUrls.push(url)
    }
    const finalUrls = [...existingUrls.value, ...uploadedUrls]
    await entriesService.update(entry.value.id, text.value, finalUrls)
    editing.value = false
    newFiles.value = []
    newPreviews.value = []
    router.push('/home')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

async function confirmDelete() {
  const alert = await alertController.create({
    header: 'Delete Entry',
    message: 'Are you sure? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await entriesService.delete(entry.value.id)
          router.push('/home')
        }
      }
    ]
  })
  await alert.present()
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
  font-size: 13px;
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
  font-size: 17px;
  line-height: 1.7;
  min-height: 120px;
}
.image-section {
  margin-top: 20px;
}
/* View-mode horizontal strip */
.image-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.strip-cell {
  flex-shrink: 0;
  width: 180px;
  height: 180px;
  border-radius: 14px;
  overflow: hidden;
}
.strip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Edit-mode grid */
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
.add-photo-btn {
  --color: #C9A55A;
  --border-color: #C9A55A;
  --border-style: dashed;
  --border-radius: 14px;
  --border-width: 1px;
}
.hint {
  font-size: 12px;
  color: #7BA190;
  margin-top: 8px;
  text-align: center;
}
.delete-section {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 0.5px solid #2A4A3A;
}
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: transparent;
  border: 0.5px solid #5A2828;
  border-radius: 14px;
  font-size: 14px;
  color: #E05C5C;
  cursor: pointer;
  font-family: inherit;
}
.error {
  color: #E05C5C;
  margin-top: 12px;
  font-size: 14px;
}
.loading-state {
  text-align: center;
  margin-top: 60px;
}
ion-buttons ion-button {
  --color: #C9A55A !important;
}
</style>
