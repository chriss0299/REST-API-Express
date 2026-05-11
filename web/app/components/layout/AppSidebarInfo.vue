<template>
  <div class="info-sidebar">
    <div class="info-section-title">Progetto</div>
    <p class="info-text">
      <strong>SocialPlace</strong> è una versione educativa di JSONPlaceholder per imparare
      le API REST, il database MySQL e lo sviluppo full-stack.
    </p>
    <q-separator dark class="q-my-md" />
    <div class="info-section-title">Stack</div>
    <div class="stack-list">
      <div v-for="item in stack" :key="item.label" class="stack-item">
        <q-icon :name="item.icon" size="16px" :color="item.color" />
        <span>{{ item.label }}</span>
      </div>
    </div>
    <q-separator dark class="q-my-md" />
    <div class="info-section-title">API Base</div>
    <code class="api-url">localhost:3000/api</code>
  </div>
</template>

<script setup lang="ts">
const stack = [
  { label: 'Nuxt 4 (SPA)', icon: 'layers', color: 'positive' },
  { label: 'Quasar UI', icon: 'palette', color: 'primary' },
  { label: 'Pinia', icon: 'storage', color: 'warning' },
  { label: 'Express.js', icon: 'code', color: 'secondary' },
  { label: 'MySQL 8', icon: 'table_chart', color: 'info' },
]
</script>

<style scoped>
.info-sidebar {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.info-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.info-text {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 4px;
}

.stack-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stack-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #cbd5e1;
}

.api-url {
  display: block;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #3a3a52;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  color: #10b981;
  font-family: monospace;
}
</style>
