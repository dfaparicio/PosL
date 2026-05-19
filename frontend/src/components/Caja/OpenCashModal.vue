<template>
  <q-dialog v-model="model" persistent>
    <q-card class="pc-modal">
      <div class="pc-modal-header">
        <div class="pc-modal-header-icon" style="background: linear-gradient(135deg, #059669, #10B981)">
          <q-icon name="lock_open" size="22px" color="white" />
        </div>
        <div class="q-ml-sm">
          <div class="pc-modal-title">Abrir Caja</div>
          <div class="pc-modal-sub">Registra el monto inicial de la sesión</div>
        </div>
        <q-space />
        <q-btn flat icon="close" color="grey-5" v-close-popup round dense :disable="loading" />
      </div>

      <div class="pc-modal-body q-gutter-md">
        <q-banner v-if="(props.montoSugerido || props.montoAnterior) > 0" class="banner-info" rounded>
          <template v-slot:avatar>
            <q-icon name="info" color="primary" />
          </template>
          <div>Saldo del día anterior: <strong>{{ formatCurrency(props.montoSugerido || props.montoAnterior) }}</strong></div>
          <div class="text-caption text-grey-6 q-mt-xs">Este monto queda en la caja física. Se precarga como monto inicial.</div>
        </q-banner>

        <q-input
          v-model.number="formData.montoInicial"
          outlined
          type="number"
          label="Monto Inicial *"
          prefix="$"
          hint="Dinero con el que inicia la caja"
          :rules="[val => val >= 0 || 'Monto no puede ser negativo']"
          :disable="loading"
          autofocus
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
          color="positive"
          label="Abrir Caja"
          icon="lock_open"
          :disable="formData.montoInicial == null || formData.montoInicial < 0"
          :loading="loading"
          unelevated
          @click="abrir"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useCajaStore } from '@/store/cajaStore'
import { formatCurrency } from '@/common/format'
import { useQuasar } from 'quasar'

const emit = defineEmits(['cajaAbierta'])
const $q = useQuasar()
const cajaStore = useCajaStore()

const model = ref(false)
const loading = ref(false)

const props = defineProps({
  montoAnterior: { type: Number, default: 0 },
  montoSugerido: { type: Number, default: 0 }
})

const formData = ref({
  montoInicial: null,
  observacion: ''
})

async function abrir() {
  loading.value = true
  try {
    await cajaStore.abrirCaja({
      montoInicial: formData.value.montoInicial,
      observacion: formData.value.observacion
    })
    $q.notify({ type: 'positive', message: 'Caja abierta exitosamente', position: 'top' })
    model.value = false
    emit('cajaAbierta')
  } catch {
    $q.notify({ type: 'negative', message: 'Error al abrir la caja', position: 'top' })
  } finally {
    loading.value = false
  }
}

function abrirModal() {
  formData.value = {
    montoInicial: (props.montoSugerido || props.montoAnterior) > 0
      ? (props.montoSugerido || props.montoAnterior)
      : null,
    observacion: ''
  }
  model.value = true
}

defineExpose({ abrirModal })
</script>

<style scoped>
.banner-info {
  background: rgba(79, 70, 229, 0.06) !important;
  border: 1px solid var(--pc-border);
}
</style>
