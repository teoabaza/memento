<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ isNew ? 'New Note' : (editing ? 'Edit Note' : '') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="editing" @click="save" :disabled="loading || !title.trim()">Save</ion-button>
          <ion-button v-else @click="editing = true">Edit</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading && !isNew" class="loading-state">
        <ion-spinner color="medium" />
      </div>

      <div v-else class="note-body">
        <!-- Title -->
        <ion-input
          v-model="title"
          :readonly="!editing"
          placeholder="Title"
          class="title-input"
        />

        <!-- Content -->
        <ion-textarea
          v-model="content"
          :readonly="!editing"
          :auto-grow="true"
          placeholder="Write your note here…"
          class="content-textarea"
        />

        <!-- Delete (only for existing notes) -->
        <div class="delete-section" v-if="!isNew">
          <button class="delete-btn" @click="confirmDelete">
            <ion-icon :icon="trashOutline" />
            Delete Note
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
  IonButtons, IonButton, IonBackButton, IonTextarea, IonInput,
  IonIcon, IonSpinner, alertController
} from '@ionic/vue'
import { notesService } from '../services/api'
import { trashOutline } from 'ionicons/icons'

const router = useRouter()
const route = useRoute()

const isNew = computed(() => route.params.id === 'new')
const title = ref('')
const content = ref('')
const editing = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  if (isNew.value) {
    editing.value = true
    return
  }
  loading.value = true
  try {
    const note = await notesService.getOne(route.params.id as string)
    if (note) {
      title.value = note.title
      content.value = note.content
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
})

async function save() {
  loading.value = true
  error.value = ''
  try {
    if (isNew.value) {
      await notesService.create(title.value, content.value)
    } else {
      await notesService.update(route.params.id as string, title.value, content.value)
    }
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
    header: 'Delete Note',
    message: 'Are you sure? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await notesService.delete(route.params.id as string)
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
.note-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.title-input {
  --background: #1C3B2D;
  --border-radius: 14px;
  --padding-start: 16px;
  --padding-end: 16px;
  --color: #F0EAD6;
  --placeholder-color: #4A6A5A;
  border: 0.5px solid #2A4A3A;
  border-radius: 14px;
  font-size: 20px;
  font-weight: 600;
  min-height: 52px;
}
.content-textarea {
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
  line-height: 1.7;
  min-height: 200px;
}
.delete-section {
  margin-top: 16px;
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
