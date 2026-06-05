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

      <div v-if="entries.length === 0 && !loading" class="empty-state">
        <p>No entries yet.</p>
        <p>Tap + to write your first line!</p>
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

      <div v-if="loading" class="loading-state">
        <ion-spinner color="medium" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onIonViewDidEnter } from '@ionic/vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon,
  IonButtons, IonButton, IonThumbnail, IonSpinner
} from '@ionic/vue'
import { add } from 'ionicons/icons'
import { entriesService, authService } from '../services/api'

const router = useRouter()
const entries = ref<any[]>([])
const loading = ref(false)

onIonViewDidEnter(async () => {
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
ion-toolbar {
  --background: #FDF8F3;
  --border-color: #EDE5DC;
}
ion-title {
  color: #2C1810;
  font-weight: 500;
  letter-spacing: -0.3px;
}
ion-button {
  --color: #A08070;
  font-size: 13px;
}
ion-content {
  --background: #FDF8F3;
}
ion-list {
  background: transparent !important;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
ion-item {
  --background: white;
  --border-radius: 16px;
  --border-color: transparent;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  --inner-border-width: 0;
  border-radius: 16px;
  border: 0.5px solid #EDE5DC;
  margin-bottom: 0;
}
.entry-date {
  font-size: 11px;
  color: #A08070;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}
.entry-text {
  font-size: 15px;
  color: #2C1810;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
ion-thumbnail {
  --size: 48px;
  --border-radius: 10px;
}
ion-fab-button {
  --background: #C4956A;
  --background-activated: #B8845A;
  --border-radius: 16px;
  --box-shadow: 0 4px 12px rgba(196, 149, 106, 0.35);
}
.empty-state {
  text-align: center;
  color: #A08070;
  margin-top: 80px;
  font-size: 15px;
  line-height: 1.6;
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