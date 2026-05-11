<template>
  <q-layout view="lHh Lpr lFf">
    <NuxtLoadingIndicator color="#6366f1" :height="3" />

    <AppNavbar />

    <q-drawer
      v-model="sidebarAperta"
      :width="260"
      :breakpoint="1024"
      bordered
      class="sp-sidebar-left"
    >
      <AppSidebar />
    </q-drawer>

    <q-page-container>
      <NuxtPage />
    </q-page-container>

    <q-drawer
      v-if="!$q.screen.lt.lg"
      side="right"
      :width="200"
      :breakpoint="1024"
      bordered
      :model-value="true"
      :overlay="false"
      class="sp-sidebar-right"
    >
      <AppSidebarInfo />
    </q-drawer>

    <LoginDialog />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const sidebarAperta = ref(true)

provide('toggleSidebar', () => { sidebarAperta.value = !sidebarAperta.value })
</script>

<style>
.sp-sidebar-left {
  background: #2a2a3e !important;
  border-right: 1px solid #3a3a52 !important;
}

.sp-sidebar-right {
  background: #2a2a3e !important;
  border-left: 1px solid #3a3a52 !important;
}

.q-page-container {
  background: #1e1e2e;
}
</style>
