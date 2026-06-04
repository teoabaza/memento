<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Memento</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="router.push('/entry/new')">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <div class="ion-padding" v-if="entries.length === 0 && !loading">
        <p style="text-align: center; color: #888; margin-top: 40px;">
          No entries yet. Tap + to write your first line!
        </p>
      </div>

      <ion-list v-else>
        <ion-item
          v-for="entry in entries"
          :key="entry.id"
          button
          @click="router.push({ name: 'Entry', params: { id: entry.id }, state: { entry } })"
        >
          <ion-label>
            <p class="entry-date">{{ formatDate(entry.date) }}</p>
            <h3 class="entry-text">{{ entry.text }}</h3>
          </ion-label>
          <ion-thumbnail slot="end" v-if="entry.imageUrl">
            <img :src="entry.imageUrl" />
          </ion-thumbnail>
        </ion-item>
      </ion-list>

      <ion-loading :is-open="loading" message="Loading..." />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon,
  IonButtons, IonButton, IonThumbnail, IonLoading
} from '@ionic/vue'
import { add } from 'ionicons/icons'
import { entriesService, authService } from '../services/api'

const router = useRouter()
const entries = ref<any[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    entries.value = await entriesService.getAll()
  } finally {
    loading.value = false
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

function logout() {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.entry-date {
  font-size: 0.75rem;
  color: #888;
}
.entry-text {
  font-size: 1rem;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>