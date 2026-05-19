<template>
  <q-dialog v-model="model" persistent>
    <q-card class="pc-modal">
      <div class="pc-modal-header">
        <div class="pc-modal-header-icon" :style="{ background: formData.tipo === 'ingreso' ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #DC2626, #EF4444)' }">
          <q-icon :name="formData.tipo === 'ingreso' ? 'add' : 'remove'" size="22px" color="white" />
        </div>
        <div class="q-ml-sm">
          <div class="pc-modal-title">Movimiento de Caja</div>
          <div class="pc-modal-sub">Registra un ingreso o retiro manual</div>
        </div>
        <q-space />
        <q-btn flat icon="close" color="grey-5" v-close-popup round dense :disable="loading" />
      </div>

      <div class="pc-modal-body q-gutter-md">
        <q-select
          v-model="formData.tipo"
          outlined
          :options="opcionesTipo"
          label="Tipo de Movimiento *"
          emit-value
          map-options
          :disable="loading"
          :rules="[val => !!val || 'Seleccione el tipo']"
        />

        <q-input
          v-model.number="formData.valor"
          outlined
          type="number"
          label="Valor *"
          prefix="$"
          :disable="loading"
          :rules="[val => val > 0 || 'Valor debe ser mayor a 0']"
        />

        <q-input
          v-model="formData.motivo"
          outlined
          label="Motivo *"
          :disable="loading"
          :rules="[val => !!val || 'El motivo es requerido']"
        />

        <q-input
          v-model="formData.observacion"
          outlined
          type="textarea"
          label="Observación"
          rows="2"
          :disable="loading"
        />
      </div>

      <div class="pc-modal-actions">
        <q-btn flat label="Cancelar" color="grey-6" v-close-popup :disable="loading" />
        <q-btn
          :color="formData.tipo === 'ingreso' ? 'positive' : 'negative'"
          :label="formData.tipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Retiro'"
          :icon="formData.tipo === 'ingreso' ? 'add_circle' : 'remove_circle'"
          :disable="!formValido"
          :loading="loading"
          unelevated
          @click="registrar"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCajaStore } from '@/store/cajaStore'

const emit = defineEmits(['movimientoRegistrado'])
const $q = useQuasar()
const cajaStore = useCajaStore()

const model = ref(false)
const loading = ref(false)

const opcionesTipo = [
  { label: 'Ingreso', value: 'ingreso' },
  { label: 'Retiro', value: 'retiro' }
]

const formData = ref({ tipo: 'ingreso', valor: null, motivo: '', observacion: '' })

const formValido = computed(() =>
  formData.value.tipo && formData.value.valor > 0 && formData.value.motivo.trim()
)

async function registrar() {
  if (!formValido.value) return
  loading.value = true
  try {
    await cajaStore.agregarMovimiento({
      ...formData.value,
      fecha: new Date().toISOString()
    })
    $q.notify({ type: 'positive', message: 'Movimiento registrado exitosamente', position: 'top' })
    model.value = false
    emit('movimientoRegistrado')
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar el movimiento', position: 'top' })
  } finally {
    loading.value = false
  }
}

function abrirModal(tipo = 'ingreso') {
  formData.value = { tipo, valor: null, motivo: '', observacion: '' }
  model.value = true
}

defineExpose({ abrirModal })
</script>

<style scoped>
</style>
