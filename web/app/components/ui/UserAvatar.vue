<template>
  <q-avatar :size="`${size}px`" :style="{ background: colore, flexShrink: 0 }">
    <span :style="{ fontSize: `${Math.floor(size * 0.38)}px`, fontWeight: '700', color: '#fff' }">
      {{ iniziali }}
    </span>
  </q-avatar>
</template>

<script setup lang="ts">
const props = defineProps<{ nome: string; id: number; size?: number }>()
const { coloreAvatar, inizialiAvatar } = useAvatar()

const colore = computed(() => coloreAvatar(props.id))
const iniziali = computed(() => inizialiAvatar(props.nome))
</script>
