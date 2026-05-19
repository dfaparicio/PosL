<template>
  <div class="row items-center justify-between full-width">
    <div class="row items-center q-gutter-x-md">
      <q-icon name="today" size="sm" color="grey-7" />
      <span class="text-subtitle2 text-grey-8">{{ fechaActual }}</span>
    </div>
    <div class="row items-center q-gutter-x-md">
      <q-badge
        :color="cajaAbierta ? 'green' : 'red'"
        text-color="white"
        class="q-px-md q-py-xs"
      >
        <q-icon :name="cajaAbierta ? 'lock_open' : 'lock'" size="xs" class="q-mr-xs" />
        {{ cajaAbierta ? 'Caja Abierta' : 'Caja Cerrada' }}
      </q-badge>
      <q-avatar color="primary" text-color="white" size="32px" icon="person" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCajaStore } from '@/store/cajaStore'
import { formatDate } from '@/common/format'

const cajaStore = useCajaStore()

const cajaAbierta = computed(() => cajaStore.cajaAbierta)
const fechaActual = computed(() => formatDate(new Date()))
</script>
