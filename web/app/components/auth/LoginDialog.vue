<template>
  <q-dialog v-model="aperto" persistent>
    <q-card class="login-dialog-card">
      <q-btn
        icon="close"
        flat
        round
        dense
        class="dialog-close"
        @click="authStore.chiudiLoginDialog()"
      />

      <q-card-section class="dialog-header">
        <div class="dialog-logo">
          <q-icon name="people" size="32px" color="primary" />
        </div>
        <div class="dialog-title">SocialPlace</div>
        <div class="dialog-subtitle">La piattaforma educativa</div>
      </q-card-section>

      <q-banner v-if="authStore.loginDialogMotivo" class="motivo-banner q-mx-md">
        <template #avatar>
          <q-icon name="info" color="info" />
        </template>
        {{ authStore.loginDialogMotivo }}
      </q-banner>

      <q-tabs v-model="tabAttiva" align="justify" active-color="primary" indicator-color="primary" class="q-mx-md">
        <q-tab name="login" label="Accedi" />
        <q-tab name="registra" label="Registrati" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tabAttiva" animated>
        <!-- TAB LOGIN -->
        <q-tab-panel name="login">
          <q-form @submit.prevent="inviaLogin" class="dialog-form">
            <q-input
              v-model="loginEmail"
              type="email"
              label="Email"
              outlined
              dense
              dark
              :rules="[v => !!v || 'Campo obbligatorio']"
            >
              <template #prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="loginPassword"
              :type="mostraPassword ? 'text' : 'password'"
              label="Password"
              outlined
              dense
              dark
              :rules="[v => !!v || 'Campo obbligatorio']"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="mostraPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="mostraPassword = !mostraPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Accedi"
              color="primary"
              unelevated
              class="full-width q-mt-sm"
              :loading="loading"
            />
          </q-form>
        </q-tab-panel>

        <!-- TAB REGISTRATI -->
        <q-tab-panel name="registra">
          <q-form @submit.prevent="inviaRegistrazione" class="dialog-form">
            <q-input
              v-model="regNome"
              label="Nome completo"
              outlined
              dense
              dark
              :rules="[v => !!v || 'Campo obbligatorio']"
            >
              <template #prepend><q-icon name="person" /></template>
            </q-input>

            <q-input
              v-model="regEmail"
              type="email"
              label="Email"
              outlined
              dense
              dark
              :rules="[v => !!v || 'Campo obbligatorio']"
            >
              <template #prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="regPassword"
              :type="mostraPassword ? 'text' : 'password'"
              label="Password"
              outlined
              dense
              dark
              :rules="[v => !!v && v.length >= 8 || 'Minimo 8 caratteri']"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="mostraPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="mostraPassword = !mostraPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="regCitta"
              label="Città (opzionale)"
              outlined
              dense
              dark
            >
              <template #prepend><q-icon name="location_city" /></template>
            </q-input>

            <q-btn
              type="submit"
              label="Crea account"
              color="primary"
              unelevated
              class="full-width q-mt-sm"
              :loading="loading"
            />
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { toastSuccesso, toastErrore } = useToast()

const aperto = computed(() => authStore.loginDialogAperto)
const tabAttiva = ref<'login' | 'registra'>('login')
const loading = ref(false)
const mostraPassword = ref(false)

const loginEmail = ref('')
const loginPassword = ref('')

const regNome = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regCitta = ref('')

async function inviaLogin() {
  loading.value = true
  try {
    await authStore.login(loginEmail.value, loginPassword.value)
    toastSuccesso(`Benvenuto, ${authStore.utente?.nome}!`)
    loginEmail.value = ''
    loginPassword.value = ''
  } catch (e: unknown) {
    toastErrore((e as Error).message || 'Credenziali non valide')
  } finally {
    loading.value = false
  }
}

async function inviaRegistrazione() {
  loading.value = true
  try {
    await authStore.registra(regNome.value, regEmail.value, regPassword.value, regCitta.value || undefined)
    toastSuccesso(`Account creato! Benvenuto, ${authStore.utente?.nome}!`)
    regNome.value = ''
    regEmail.value = ''
    regPassword.value = ''
    regCitta.value = ''
  } catch (e: unknown) {
    toastErrore((e as Error).message || 'Errore durante la registrazione')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-dialog-card {
  width: 380px;
  max-width: 95vw;
  background: #2a2a3e;
  border: 1px solid #3a3a52;
  border-radius: 16px;
  padding-bottom: 16px;
  position: relative;
}

.dialog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.dialog-header {
  text-align: center;
  padding: 28px 24px 16px;
}

.dialog-logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
}

.dialog-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 2px;
}

.motivo-banner {
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 8px;
  margin-bottom: 8px;
  color: #93c5fd;
  font-size: 13px;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
