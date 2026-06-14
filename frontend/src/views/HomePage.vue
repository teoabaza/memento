<template>
  <ion-page>
    <ion-header :translucent="false">
      <ion-toolbar class="nav-toolbar">
        <ion-buttons slot="start">
          <span class="brand">
            <img src="/logo-dark.png" alt="" class="brand-logo" />
            Memento
          </span>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="logout" class="logout-btn">Sign out</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Pill tab switcher -->
      <div class="tab-pills">
        <button class="tab-pill" :class="{ active: activeTab === 'diary' }" @click="activeTab = 'diary'">Diary</button>
        <button class="tab-pill" :class="{ active: activeTab === 'notes' }" @click="activeTab = 'notes'">Notes</button>
      </div>

      <!-- Floating action buttons -->
      <div class="fabs" slot="fixed">
        <button
          v-if="activeTab === 'diary' && entries.length > 0"
          class="fab-btn fab-secondary"
          @click="diaryView = diaryView === 'list' ? 'calendar' : 'list'"
        >
          <ion-icon :icon="diaryView === 'list' ? calendarOutline : listOutline" />
        </button>
        <button class="fab-btn fab-primary" @click="fabAction">
          <ion-icon :icon="add" />
        </button>
      </div>

      <!-- DIARY -->
      <template v-if="activeTab === 'diary'">
        <div v-if="diaryLoading" class="loading-state">
          <ion-spinner />
        </div>
        <div v-else-if="entries.length === 0" class="empty-state">
          <img src="/logo.png" alt="" class="empty-logo" />
          <p class="empty-title">No entries yet</p>
          <p class="empty-sub">Tap + to write your first line</p>
        </div>
        <template v-else>
          <!-- List view -->
          <div v-if="diaryView === 'list'" class="list-wrap">
            <div
              v-for="entry in entries"
              :key="entry.id"
              class="card"
              @click="router.push({ name: 'Entry', params: { id: entry.id } })"
            >
              <div class="card-main">
                <p class="card-date">{{ formatDate(entry.date) }}</p>
                <p class="card-text">{{ entry.text }}</p>
              </div>
              <div class="card-thumbs" v-if="entry.imageUrls?.length">
                <img
                  v-for="(url, i) in entry.imageUrls.slice(0, 3)"
                  :key="i" :src="url"
                  class="card-thumb"
                  :style="{ zIndex: 3 - i, marginLeft: i > 0 ? '-10px' : '0' }"
                />
                <span v-if="entry.imageUrls.length > 3" class="thumb-more">+{{ entry.imageUrls.length - 3 }}</span>
              </div>
            </div>
          </div>

          <!-- Calendar view -->
          <div v-else class="calendar-wrap">
            <div class="cal-card">
              <!-- Month nav -->
              <div class="cal-header">
                <button class="cal-nav" @click="prevMonth">‹</button>
                <span class="cal-month-label">{{ calMonthLabel }}</span>
                <button class="cal-nav" @click="nextMonth">›</button>
              </div>

              <!-- Day-of-week headers -->
              <div class="cal-grid">
                <div class="cal-dow" v-for="d in ['M','T','W','T','F','S','S']" :key="d">{{ d }}</div>

                <!-- Empty offset cells -->
                <div v-for="n in firstDayOffset" :key="'o' + n" class="cal-cell cal-empty" />

                <!-- Day cells -->
                <div
                  v-for="day in daysInMonth"
                  :key="day"
                  class="cal-cell"
                  :class="{
                    'has-entry': getEntriesForDay(day).length > 0,
                    'is-today': isToday(day)
                  }"
                  @click="handleDayClick(day)"
                >
                  <span class="cal-num">{{ day }}</span>
                  <div class="cal-dots" v-if="getEntriesForDay(day).length > 0">
                    <span
                      v-for="(_, i) in getEntriesForDay(day).slice(0, 3)"
                      :key="i"
                      class="cal-dot"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- NOTES -->
      <template v-else>
        <div v-if="notesLoading" class="loading-state">
          <ion-spinner />
        </div>
        <div v-else-if="notes.length === 0" class="empty-state">
          <img src="/logo.png" alt="" class="empty-logo" />
          <p class="empty-title">No notes yet</p>
          <p class="empty-sub">Tap + to create your first note</p>
        </div>
        <div v-else class="list-wrap">
          <div
            v-for="note in notes"
            :key="note.id"
            class="card"
            @click="router.push({ name: 'Note', params: { id: note.id } })"
          >
            <div class="card-main">
              <p class="note-title">{{ note.title || 'Untitled' }}</p>
              <p class="note-preview">{{ note.content }}</p>
            </div>
            <p class="note-date">{{ formatShortDate(note.updatedAt) }}</p>
          </div>
        </div>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onIonViewDidEnter } from '@ionic/vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonContent,
  IonIcon, IonButtons, IonButton, IonSpinner
} from '@ionic/vue'
import { add, listOutline, calendarOutline } from 'ionicons/icons'
import { entriesService, notesService, authService } from '../services/api'

const router = useRouter()
const activeTab = ref<'diary' | 'notes'>('diary')
const diaryView = ref<'list' | 'calendar'>('list')

const entries = ref<any[]>([])
const diaryLoading = ref(false)
const notes = ref<any[]>([])
const notesLoading = ref(false)

// Calendar state
const calDate = ref(new Date())

const calMonthLabel = computed(() =>
  calDate.value.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
)

const daysInMonth = computed(() =>
  new Date(calDate.value.getFullYear(), calDate.value.getMonth() + 1, 0).getDate()
)

const firstDayOffset = computed(() => {
  const first = new Date(calDate.value.getFullYear(), calDate.value.getMonth(), 1).getDay()
  return (first + 6) % 7 // Monday = 0
})

const entriesByDate = computed(() => {
  const map = new Map<string, any[]>()
  for (const entry of entries.value) {
    const key = new Date(entry.date).toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }
  return map
})

function dayKey(day: number) {
  const y = calDate.value.getFullYear()
  const m = String(calDate.value.getMonth() + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getEntriesForDay(day: number) {
  return entriesByDate.value.get(dayKey(day)) ?? []
}

function isToday(day: number) {
  const t = new Date()
  const c = calDate.value
  return t.getFullYear() === c.getFullYear() && t.getMonth() === c.getMonth() && t.getDate() === day
}

function prevMonth() {
  calDate.value = new Date(calDate.value.getFullYear(), calDate.value.getMonth() - 1, 1)
}
function nextMonth() {
  calDate.value = new Date(calDate.value.getFullYear(), calDate.value.getMonth() + 1, 1)
}

function handleDayClick(day: number) {
  const dayEntries = getEntriesForDay(day)
  if (!dayEntries.length) return
  router.push({ name: 'Entry', params: { id: dayEntries[0].id } })
}

onIonViewDidEnter(() => { loadDiary(); loadNotes() })

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
  router.push(activeTab.value === 'diary' ? '/entry/new' : '/note/new')
}
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}
function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function logout() {
  authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-toolbar {
  --background: #152742;
  --border-color: transparent;
  --color: #FFFFFF;
  --padding-start: 10px;
  --padding-end: 10px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-family: Georgia, serif;
}
.brand-logo { width: 40px; height: 40px; object-fit: contain; border-radius: 50%; opacity: 0.9; }
.logout-btn { --color: #f7f1e8; font-size: 12px; font-weight: 400; letter-spacing: 0.3px; text-transform: none; }
.logout-btn::part(native) { color: #f7f1e8; }

/* Tabs */
.tab-pills { display: flex; gap: 8px; padding: 16px 16px 4px; }
.tab-pill {
  flex: 1; padding: 10px 0; border-radius: 12px; border: none;
  font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit;
  transition: background 0.18s, color 0.18s;
  background: rgba(37,51,80,0.08); color: #7A8699;
}
.tab-pill.active { background: #253350; color: #FFFFFF; }

ion-content { --background: #f7f1e8; }

/* Floating action buttons */
.fabs {
  position: fixed;
  bottom: 24px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 999;
}
.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fab-secondary {
  background: #FFFFFF;
  color: #253350;
  box-shadow: 0 2px 12px rgba(37,51,80,0.15);
}
.fab-primary {
  background: #B87355;
  color: #FFFFFF;
  box-shadow: 0 4px 16px rgba(184,115,85,0.40);
}

/* List */
.list-wrap { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.card {
  background: #FFFFFF; border-radius: 18px; padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(37,51,80,0.07);
  display: flex; align-items: center; gap: 12px; cursor: pointer;
}
.card:active { box-shadow: 0 1px 4px rgba(37,51,80,0.05); }
.card-main { flex: 1; min-width: 0; }
.card-date { font-size: 10px; color: #B87355; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; margin: 0 0 5px; }
.card-text { font-size: 15px; color: #1A2640; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-thumbs { display: flex; align-items: center; flex-shrink: 0; }
.card-thumb { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; border: 2px solid #FFFFFF; }
.thumb-more { font-size: 11px; color: #7A8699; margin-left: 5px; }

/* Notes */
.note-title { font-size: 15px; color: #1A2640; font-weight: 500; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-preview { font-size: 13px; color: #7A8699; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-date { font-size: 11px; color: #B0B8C8; flex-shrink: 0; margin: 0; }

/* Calendar */
.calendar-wrap { padding: 12px 16px; }
.cal-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px 16px;
  box-shadow: 0 2px 10px rgba(37,51,80,0.07);
}
.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.cal-month-label {
  font-size: 15px;
  font-weight: 600;
  color: #1A2640;
  letter-spacing: 0.2px;
}
.cal-nav {
  background: none;
  border: none;
  font-size: 22px;
  color: #253350;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  line-height: 1;
}
.cal-nav:active { background: rgba(37,51,80,0.08); }

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px 2px;
}
.cal-dow {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #B0B8C8;
  letter-spacing: 0.3px;
  padding-bottom: 8px;
}
.cal-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 2px 4px;
  border-radius: 10px;
  min-height: 44px;
  cursor: default;
}
.cal-empty { cursor: default; }
.cal-cell.has-entry { cursor: pointer; }
.cal-cell.has-entry:active { background: rgba(184,115,85,0.08); }
.cal-cell.is-today .cal-num {
  background: #253350;
  color: #FFFFFF !important;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal-num {
  font-size: 14px;
  color: #1A2640;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal-cell.has-entry .cal-num { font-weight: 600; color: #253350; }
.cal-dots {
  display: flex;
  gap: 3px;
  margin-top: 3px;
}
.cal-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #B87355;
  display: block;
}

/* Empty / loading */
.empty-state { text-align: center; padding: 100px 32px 0; }
.empty-logo { width: 72px; height: 72px; object-fit: contain; opacity: 0.6; margin-bottom: 16px; }
.empty-title { font-size: 16px; color: #253350; font-weight: 500; margin: 0 0 4px; }
.empty-sub { font-size: 14px; color: #7A8699; margin: 0; }
.loading-state { text-align: center; padding-top: 80px; }

</style>
