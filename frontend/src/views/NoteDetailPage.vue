<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" />
        </ion-buttons>
        <ion-title>{{ isNew ? 'New Note' : (editing ? 'Edit Note' : 'Note') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="editing" @click="save" :disabled="loading || !title.trim()">Save</ion-button>
          <ion-button v-else @click="editing = true">Edit</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading && !isNew" class="loading-state">
        <ion-spinner />
      </div>

      <div v-else class="note-body">
        <div class="title-card">
          <ion-input
            v-model="title"
            :readonly="!editing"
            placeholder="Title"
            class="title-input"
          />
        </div>

        <div class="content-card">
          <ion-textarea
            v-model="content"
            :readonly="!editing"
            :auto-grow="true"
            placeholder="Write your note here…"
            class="content-textarea"
          />
        </div>

        <div class="delete-section" v-if="!isNew">
          <button class="delete-btn" @click="confirmDelete">
            <ion-icon :icon="trashOutline" />
            Delete note
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
  if (isNew.value) { editing.value = true; return }
  loading.value = true
  try {
    const note = await notesService.getOne(route.params.id as string)
    if (note) { title.value = note.title; content.value = note.content }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
})

async function save() {
  loading.value = true; error.value = ''
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
    header: 'Delete note',
    message: 'This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', role: 'destructive', handler: async () => {
        await notesService.delete(route.params.id as string)
        router.push('/home')
      }}
    ]
  })
  await alert.present()
}
</script>

<style scoped>
ion-toolbar { --background: #FFFFFF; --border-color: #E4DAD0; }
ion-title { color: #1A2640; font-weight: 500; font-size: 16px; }
ion-back-button { --color: #B87355; }
ion-button { --color: #253350; font-weight: 600; }
ion-content { --background: #f7f1e8; }

.note-body { display: flex; flex-direction: column; gap: 12px; }

.title-card {
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(37,51,80,0.07);
  overflow: hidden;
}
.title-input {
  --background: transparent;
  --padding-start: 18px; --padding-end: 18px;
  --color: #1A2640; --placeholder-color: #C0C8D8;
  font-size: 22px; font-weight: 600;
  min-height: 56px;
}

.content-card {
  background: #FFFFFF;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(37,51,80,0.07);
  overflow: hidden;
}
.content-textarea {
  --background: transparent;
  --padding-start: 18px; --padding-end: 18px;
  --padding-top: 16px; --padding-bottom: 16px;
  --color: #1A2640; --placeholder-color: #C0C8D8;
  font-size: 16px; line-height: 1.7; min-height: 200px;
}

.delete-section { margin-top: 8px; padding-top: 20px; border-top: 1px solid #E4DAD0; }
.delete-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; width: 100%; padding: 13px;
  background: transparent; border: 1px solid #B87355;
  border-radius: 10px; font-size: 14px; color: #B87355;
  cursor: pointer; font-family: inherit; font-weight: 500;
}
.error { color: #C0504A; font-size: 14px; }
.loading-state { text-align: center; padding-top: 60px; }
ion-buttons ion-button { --color: #253350 !important; }
</style>
