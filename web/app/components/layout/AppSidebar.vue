<template>
  <div class="sidebar-content">
    <!-- Statistiche -->
    <div class="sidebar-section">
      <div class="sidebar-section-title">Statistiche</div>
      <div class="stats-list">
        <div class="stat-item">
          <q-icon name="people" color="primary" size="20px" />
          <div>
            <div class="stat-value">{{ statsStore.conteggioUtenti }}</div>
            <div class="stat-label">Utenti</div>
          </div>
        </div>
        <div class="stat-item">
          <q-icon name="article" color="secondary" size="20px" />
          <div>
            <div class="stat-value">{{ statsStore.conteggioPost }}</div>
            <div class="stat-label">Post</div>
          </div>
        </div>
        <div class="stat-item">
          <q-icon name="chat_bubble_outline" color="info" size="20px" />
          <div>
            <div class="stat-value">{{ statsStore.conteggioCommenti }}</div>
            <div class="stat-label">Commenti</div>
          </div>
        </div>
      </div>
    </div>

    <q-separator dark class="q-my-md" />

    <!-- Utente loggato -->
    <template v-if="isLoggedIn">
      <div class="sidebar-section">
        <div class="sidebar-section-title">Account</div>
        <div class="user-info">
          <UserAvatar :nome="utente!.nome" :id="utente!.id" :size="40" />
          <div class="user-info-text">
            <div class="user-name">{{ utente!.nome }}</div>
            <div class="user-email">{{ utente!.email }}</div>
            <span :class="utente!.ruolo === 'admin' ? 'badge-admin' : 'badge-utente'">
              {{ utente!.ruolo }}
            </span>
          </div>
        </div>
      </div>

      <!-- Admin View Banner -->
      <div v-if="adminViewAttiva" class="admin-banner q-mt-md">
        <div class="admin-banner-header">
          <q-icon name="admin_panel_settings" color="primary" size="18px" />
          <span>Modalità Admin</span>
        </div>
        <div class="admin-banner-text">
          Vedi tutti i controlli di amministrazione.
        </div>
      </div>
    </template>

    <!-- Non loggato -->
    <template v-else>
      <div class="sidebar-section">
        <div class="sidebar-section-title">Account</div>
        <p class="sidebar-hint">Accedi per pubblicare e interagire con i contenuti.</p>
        <q-btn
          label="Accedi"
          color="primary"
          unelevated
          class="full-width"
          icon="login"
          @click="apriLoginDialog()"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useStatisticheStore } from '~/stores/statistiche'

const statsStore = useStatisticheStore()
const { isLoggedIn, utente, adminViewAttiva, apriLoginDialog } = useAuth()

onMounted(() => statsStore.aggiorna())
</script>

<style scoped>
.sidebar-content {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.sidebar-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.user-info-text {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.admin-banner-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #a5b4fc;
  margin-bottom: 4px;
}

.admin-banner-text {
  font-size: 12px;
  color: #94a3b8;
}

.sidebar-hint {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 12px;
  line-height: 1.5;
}
</style>
