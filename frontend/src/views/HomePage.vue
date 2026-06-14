<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <span class="app-title">
            <svg viewBox="0 0 28 28" class="title-logo" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#1C3B2D"/>
              <path d="M10 8.5 L14 20.5 L18 8.5 Z" fill="none" stroke="#C9A55A" stroke-width="1.4" stroke-linejoin="round"/>
              <rect x="11.5" y="3.5" width="5" height="5.5" rx="1.5" fill="none" stroke="#C9A55A" stroke-width="1.4"/>
              <circle cx="14" cy="16" r="1.2" fill="none" stroke="#C9A55A" stroke-width="1.2"/>
              <path d="M9 24 Q11.5 22 14 23 Q16.5 24 19 22.5" fill="none" stroke="#C9A55A" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            Memento
          </span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout" class="logout-btn">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Tab segment -->
      <ion-toolbar class="tab-toolbar">
        <ion-segment v-model="activeTab" class="tab-segment">
          <ion-segment-button value="diary">
            <ion-label>Diary</ion-label>
          </ion-segment-button>
          <ion-segment-button value="notes">
            <ion-label>Notes</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- FAB changes based on tab -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="fabAction">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <!-- DIARY TAB -->
      <template v-if="activeTab === 'diary'">
        <div v-if="diaryLoading" class="loading-state">
          <ion-spinner color="medium" />
        </div>
        <div v-else-if="entries.length === 0" class="empty-state">
          <div class="empty-icon">✦</div>
          <p class="empty-title">No entries yet</p>
          <p class="empty-sub">Tap + to write your first line</p>
        </div>
        <ion-list v-else>
          <ion-item
            v-for="entry in entries"
            :key="entry.id"
            button
            @click="router.push({ name: 'Entry', params: { id: entry.id } })"
          >
            <ion-label>
              <p class="entry-date">{{ formatDate(entry.date) }}</p>
              <h3 class="entry-text">{{ entry.text }}</h3>
            </ion-label>
            <div class="thumb-stack" slot="end" v-if="entry.imageUrls?.length">
              <img
                v-for="(url, i) in entry.imageUrls.slice(0, 3)"
                :key="i"
                :src="url"
                class="thumb"
                :style="{ zIndex: 3 - i, transform: `translateX(${i * -10}px)` }"
              />
              <span v-if="entry.imageUrls.length > 3" class="thumb-extra">
                +{{ entry.imageUrls.length - 3 }}
              </span>
            </div>
          </ion-item>
        </ion-list>
      </template>

      <!-- NOTES TAB -->
      <template v-else>
        <div v-if="notesLoading" class="loading-state">
          <ion-spinner color="medium" />
        </div>
        <div v-else-if="notes.length === 0" class="empty-state">
          <div class="empty-icon">✦</div>
          <p class="empty-title">No notes yet</p>
          <p class="empty-sub">Tap + to create your first note</p>
        </div>
        <ion-list v-else>
          <ion-item
            v-for="note in notes"
            :key="note.id"
            button
            @click="router.push({ name: 'Note', params: { id: note.id } })"
          >
            <ion-label>
              <h3 class="note-title">{{ note.title || 'Untitled' }}</h3>
              <p class="note-preview">{{ note.content }}</p>
            </ion-label>
            <p class="note-date" slot="end">{{ formatShortDate(note.updatedAt) }}</p>
          </ion-item>
        </ion-list>
      </template>
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
  IonButtons, IonButton, IonSpinner, IonSegment, IonSegmentButton
} from '@ionic/vue'
import { add } from 'ionicons/icons'
import { entriesService, notesService, authService } from '../services/api'

const router = useRouter()
const activeTab = ref<'diary' | 'notes'>('diary')

const entries = ref<any[]>([])
const diaryLoading = ref(false)

const notes = ref<any[]>([])
const notesLoading = ref(false)

onIonViewDidEnter(async () => {
  loadDiary()
  loadNotes()
})

async function loadDiary() {
  diaryLoading.value = true
  try { entries.value = await entriesService.getAll() }
  finally { diaryLoading.value = false }
}

async function loadNotes() {
  notesLoading.value = true
  try { notes.value = await notesService.getAll() }
  finally { notesLoading.value = false }
}

function fabAction() {
  if (activeTab.value === 'diary') {
    router.push('/entry/new')
  } else {
    router.push('/note/new')
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short'
  })
}

function logout() {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
ion-toolbar {
  --background: #1C3B2D;
  --border-color: #2A4A3A;
}
.app-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #F0EAD6;
  font-weight: 600;
  font-size: 17px;
}
.title-logo {
  width: 28px;
  height: 28px;
  border-radius: 7px;
}
.logout-btn {
  --color: #7BA190;
  font-size: 13px;
}
.tab-toolbar {
  --background: #1C3B2D;
  --border-color: #2A4A3A;
  --min-height: 44px;
}
.tab-segment {
  --background: transparent;
  margin: 0 16px 4px;
  border-bottom: 1px solid #2A4A3A;
}
ion-segment-button {
  --color: #7BA190;
  --color-checked: #C9A55A;
  --indicator-color: #C9A55A;
  --indicator-height: 2px;
  --border-radius: 0;
  --padding-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
ion-content {
  --background: #162E24;
}
ion-list {
  background: transparent !important;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
ion-item {
  --background: #1C3B2D;
  --border-radius: 16px;
  --border-color: transparent;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  --inner-border-width: 0;
  --color: #F0EAD6;
  border-radius: 16px;
  border: 0.5px solid #2A4A3A;
  margin-bottom: 0;
}
.entry-date {
  font-size: 10px;
  color: #7BA190;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}
.entry-text {
  font-size: 15px;
  color: #F0EAD6;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}
/* Stacked image thumbnails */
.thumb-stack {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: 4px;
}
.thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  border: 1.5px solid #162E24;
  position: relative;
}
.thumb-extra {
  font-size: 11px;
  color: #7BA190;
  margin-left: 4px;
}
/* Notes */
.note-title {
  font-size: 15px;
  color: #F0EAD6;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.note-preview {
  font-size: 13px;
  color: #7BA190;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.note-date {
  font-size: 11px;
  color: #4A6A5A;
  white-space: nowrap;
  flex-shrink: 0;
}
/* Empty state */
.empty-state {
  text-align: center;
  margin-top: 100px;
  padding: 0 32px;
}
.empty-icon {
  font-size: 28px;
  color: #C9A55A;
  margin-bottom: 12px;
  opacity: 0.6;
}
.empty-title {
  font-size: 16px;
  color: #F0EAD6;
  margin: 0 0 4px;
  font-weight: 500;
}
.empty-sub {
  font-size: 14px;
  color: #7BA190;
  margin: 0;
}
.loading-state {
  text-align: center;
  margin-top: 80px;
}
ion-fab-button {
  --background: #C9A55A;
  --background-activated: #B8945A;
  --color: #162E24;
  --border-radius: 16px;
  --box-shadow: 0 4px 16px rgba(201, 165, 90, 0.35);
}
</style>
