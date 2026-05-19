<template>
  <div class="column items-center justify-center q-pa-lg text-center">
    <div class="empty-icon-container q-mb-md">
      <q-icon :name="icon" size="48px" color="primary" />
    </div>
    <div class="text-subtitle1 text-weight-bold text-dark q-mb-xs">{{ title }}</div>
    <div class="text-body2 text-grey-6" style="max-width:260px">{{ message }}</div>
    <q-btn
      v-if="actionLabel"
      :label="actionLabel"
      :to="actionTo || undefined"
      color="primary"
      unelevated
      rounded
      size="sm"
      class="q-mt-md"
      @click="actionFn && actionFn()"
    />
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, default: 'Sin datos' },
  message: { type: String, default: 'No hay información para mostrar' },
  actionLabel: { type: String, default: '' },
  actionTo: { type: String, default: '' },
  actionFn: { type: Function, default: null }
})
</script>

<style scoped>
.empty-icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(79, 70, 229, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
