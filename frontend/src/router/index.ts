import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { authService } from '../services/api';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/entry/new',
    name: 'NewEntry',
    component: () => import('../views/NewEntryPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/entry/:id',
    name: 'Entry',
    component: () => import('../views/EntryPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/note/:id',
    name: 'Note',
    component: () => import('../views/NoteDetailPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard protected routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authService.isLoggedIn()) {
    next('/login')
  } else {
    next()
  }
})

export default router
