<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ formatDate(entry?.date) }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="save" :disabled="loading" v-if="editing">
            Save
          </ion-button>
          <ion-button @click="editing = true" v-else>
            Edit
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
    <div v-if="loading" class="loading-state" style="text-align: center; margin-top: 40px;">
      <ion-spinner color="medium" />
    </div>

    <div v-else-if="entry">
      <ion-textarea
        v-model="text"
        :readonly="!editing"
        :auto-grow="true"
        class="entry-textarea"
      />

      <div class="image-section" v-if="editing">
        <ion-button fill="outline" expand="block" @click="pickImage">
          <ion-icon :icon="image" slot="start" />
          {{ selectedImage ? 'Change Photo' : 'Add Photo' }}
        </ion-button>
      </div>

      <div class="image-preview" v-if="selectedImage || entry.imageUrl">
        <img :src="selectedImage || entry.imageUrl" />
      </div>

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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonBackButton, IonTextarea,
  IonIcon, IonSpinner, alertController
} from '@ionic/vue'
import { entriesService } from '../services/api'
import { image, trashOutline } from 'ionicons/icons'

const router = useRouter()
const route = useRoute()
const entry = ref<any>(null)
const text = ref('')
const selectedImage = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const editing = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    entry.value = await entriesService.getOne(route.params.id as string)
    if (entry.value) text.value = entry.value.text
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
    let imageUrl = entry.value.imageUrl
    if (selectedFile.value) {
      imageUrl = await entriesService.uploadImage(selectedFile.value)
    }
    await entriesService.update(
      entry.value.id,
      text.value,
      imageUrl
    )
    editing.value = false
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
    message: 'Are you sure you want to delete this entry?',
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
  --background: #FDF8F3;
  --border-color: #EDE5DC;
}
ion-title {
  color: #2C1810;
  font-weight: 500;
  font-size: 13px;
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
.entry-textarea {
  --background: white;
  --border-radius: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  border: 0.5px solid #EDE5DC;
  border-radius: 16px;
  font-size: 17px;
  color: #2C1810;
  line-height: 1.7;
  min-height: 120px;
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
  margin-top: 16px;
  border-radius: 16px;
  overflow: hidden;
}
.image-preview img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
}
ion-button[fill="clear"][color="danger"] {
  --color: #C89090;
  margin-top: 8px;
  font-size: 14px;
}
.error {
  color: #E24B4A;
  margin-top: 12px;
  font-size: 14px;
}
.delete-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 0.5px solid #EDE5DC;
}
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: transparent;
  border: 0.5px solid #E8C8C8;
  border-radius: 14px;
  font-size: 14px;
  color: #C89090;
  cursor: pointer;
  font-family: var(--font-sans);
}
.loading-state {
  text-align: center;
  margin-top: 60px;
  color: #A08070;
}
ion-buttons ion-button {
  --color: #A08070 !important;
}
</style>