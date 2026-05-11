<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">{{ error.statusCode }}</div>
      <h1 class="error-title">
        {{ error.statusCode === 404 ? 'Pagina non trovata' : 'Errore del server' }}
      </h1>
      <p class="error-msg">
        {{ error.statusCode === 404
          ? 'La pagina che cerchi non esiste o è stata spostata.'
          : 'Si è verificato un errore imprevisto. Riprova tra poco.' }}
      </p>
      <q-btn
        label="Torna alla home"
        color="primary"
        unelevated
        rounded
        icon="home"
        @click="clearError({ redirect: '/' })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ bodyAttrs: { style: 'background:#1e1e2e; color:#f1f5f9; margin:0' } })

const props = defineProps<{ error: { statusCode: number; message?: string } }>()
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e1e2e;
  padding: 24px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-code {
  font-size: 96px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 12px;
}

.error-msg {
  color: #94a3b8;
  margin: 0 0 32px;
  line-height: 1.6;
}
</style>
