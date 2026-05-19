<template>
  <q-dialog v-model="model" persistent>
    <q-card class="pc-modal" style="min-width: 350px">
      <q-card-section class="row items-center">
        <q-icon name="warning" color="warning" size="md" class="q-mr-sm" />
        <span class="text-h6">{{ title }}</span>
      </q-card-section>

      <q-card-section>
        <p class="text-body1">{{ message }}</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup @click="onCancel" />
        <q-btn flat label="Confirmar" color="primary" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '¿Está seguro de realizar esta acción?' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
