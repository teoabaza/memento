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
    <div v-if="loading" style="text-align: center; margin-top: 40px;">
      <ion-spinner />
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

      <ion-button
        fill="clear"
        color="danger"
        expand="block"
        class="ion-margin-top"
        @click="confirmDelete"
      >
        Delete Entry
      </ion-button>

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
import { image } from 'ionicons/icons'
import { entriesService } from '../services/api'

const router = useRouter()
const route = useRoute()
const entry = ref<any>(null)
const text = ref('')
const selectedImage = ref<string | null>(null)
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
    await entriesService.update(
      entry.value.id,
      text.value,
      selectedImage.value || entry.value.imageUrl
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
.entry-textarea {
  font-size: 1.1rem;
  min-height: 120px;
  --padding-start: 0;
}
.image-section {
  margin-top: 24px;
}
.image-preview {
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
}
.image-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}
.error {
  color: red;
  margin-top: 12px;
}
</style>