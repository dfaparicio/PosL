<template>
  <q-list dark class="q-py-sm">
    <q-item
      v-for="item in menuItems"
      :key="item.path"
      :to="item.path"
      clickable
      v-ripple
      exact
      class="sidebar-item"
    >
      <q-item-section avatar>
        <q-icon :name="item.icon" />
      </q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const menuItems = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Ventas', path: '/ventas', icon: 'point_of_sale' },
  { label: 'Caja', path: '/caja', icon: 'account_balance' },
  { label: 'Historial', path: '/historial', icon: 'history' },
  { label: 'Configuración', path: '/configuracion', icon: 'settings' }
]
</script>

<style scoped>
</style>
