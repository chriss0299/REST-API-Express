<template>
  <q-header elevated class="sp-navbar">
    <q-toolbar>
      <!-- Hamburger mobile -->
      <q-btn
        v-if="$q.screen.lt.lg"
        flat
        round
        dense
        icon="menu"
        @click="toggleSidebar?.()"
        class="q-mr-sm"
      />

      <!-- Logo -->
      <NuxtLink to="/utenti" class="navbar-logo">
        <q-icon name="people" size="22px" />
        <span>SocialPlace</span>
      </NuxtLink>

      <!-- Tab navigazione (desktop) -->
      <div v-if="!$q.screen.lt.sm" class="navbar-tabs q-ml-lg">
        <NuxtLink v-for="tab in tabs" :key="tab.to" :to="tab.to" custom v-slot="{ isActive, navigate }">
          <q-btn
            flat
            :label="tab.label"
            :icon="tab.icon"
            :class="['navbar-tab', { 'navbar-tab--active': isActive || isTabActive(tab.to) }]"
            @click="navigate"
          />
        </NuxtLink>
      </div>

      <q-space />

      <!-- Admin View switch -->
      <q-toggle
        v-if="isAdmin"
        v-model="adminViewAttivaModel"
        label="Admin View"
        color="primary"
        size="sm"
        class="q-mr-md admin-toggle"
        @update:model-value="toggleAdminView"
      >
        <q-tooltip>Attiva/disattiva la vista amministratore</q-tooltip>
      </q-toggle>

      <!-- Utente loggato -->
      <template v-if="isLoggedIn">
        <div class="navbar-user q-mr-sm">
          <UserAvatar :nome="utente!.nome" :id="utente!.id" :size="28" />
          <span v-if="!$q.screen.lt.md" class="navbar-username">{{ utente!.nome }}</span>
        </div>
        <q-btn flat dense round icon="logout" @click="handleLogout">
          <q-tooltip>Esci</q-tooltip>
        </q-btn>
      </template>

      <!-- Non loggato -->
      <q-btn
        v-else
        flat
        label="Accedi"
        icon="login"
        color="primary"
        @click="apriLoginDialog()"
      />
    </q-toolbar>

    <!-- Tab navigazione mobile -->
    <q-tabs
      v-if="$q.screen.lt.sm"
      align="justify"
      active-color="primary"
      indicator-color="primary"
      class="mobile-tabs"
    >
      <q-tab
        v-for="tab in tabs"
        :key="tab.to"
        :label="tab.label"
        :icon="tab.icon"
        @click="navigateTo(tab.to)"
      />
    </q-tabs>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { isLoggedIn, isAdmin, utente, apriLoginDialog, logout, adminViewAttiva, toggleAdminView } = useAuth()
const { toastSuccesso } = useToast()

const toggleSidebar = inject<() => void>('toggleSidebar')

const adminViewAttivaModel = computed(() => adminViewAttiva.value)

const tabs = [
  { to: '/utenti', label: 'Persone', icon: 'people' },
  { to: '/post', label: 'Feed', icon: 'article' },
  { to: '/commenti', label: 'Commenti', icon: 'chat_bubble_outline' },
]

function isTabActive(to: string) {
  return route.path.startsWith(to)
}

async function handleLogout() {
  await logout()
  toastSuccesso('Logout effettuato')
  await navigateTo('/utenti')
}
</script>

<style scoped>
.sp-navbar {
  background: #121218 !important;
  border-bottom: 1px solid #3a3a52;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  white-space: nowrap;
}

.navbar-tabs {
  display: flex;
  gap: 2px;
}

.navbar-tab {
  color: #94a3b8 !important;
  font-weight: 500;
  font-size: 13px;
  border-radius: 8px;
}

.navbar-tab--active {
  color: #f1f5f9 !important;
  background: rgba(99, 102, 241, 0.15) !important;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-username {
  font-size: 13px;
  font-weight: 500;
  color: #f1f5f9;
}

.admin-toggle {
  font-size: 12px;
  color: #94a3b8;
}

.mobile-tabs {
  background: #121218;
  border-top: 1px solid #3a3a52;
}
</style>
