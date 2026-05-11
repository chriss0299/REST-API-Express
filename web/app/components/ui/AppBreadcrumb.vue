<template>
  <q-breadcrumbs v-if="voci.length > 1" class="sp-breadcrumb q-mb-md" active-color="primary" separator-color="grey-7">
    <q-breadcrumbs-el
      v-for="(voce, i) in voci"
      :key="i"
      :label="voce.label"
      :icon="voce.icon"
      :to="voce.to"
      :class="{ 'breadcrumb-current': i === voci.length - 1 }"
    />
  </q-breadcrumbs>
</template>

<script setup lang="ts">
const props = defineProps<{
  voci: Array<{ label: string; icon?: string; to?: string }>
}>()
</script>

<style scoped>
.sp-breadcrumb {
  font-size: 13px;
}

.breadcrumb-current {
  color: #f1f5f9 !important;
  font-weight: 600;
}
</style>
