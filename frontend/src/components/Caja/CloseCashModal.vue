<template>
  <q-dialog v-model="model" persistent>
    <q-card class="pc-modal">
      <div class="pc-modal-header">
        <div class="pc-modal-header-icon" style="background: linear-gradient(135deg, #DC2626, #EF4444)">
          <q-icon name="lock" size="22px" color="white" />
        </div>
        <div class="q-ml-sm">
          <div class="pc-modal-title">Cerrar Caja</div>
          <div class="pc-modal-sub">Revisa el resumen e ingresa el dinero contado</div>
        </div>
        <q-space />
        <q-btn flat icon="close" color="grey-5" v-close-popup round dense :disable="loading" />
      </div>

      <div class="pc-modal-body q-gutter-md">
        <!-- Resumen -->
        <div class="resumen-caja q-pa-sm">
          <div class="pc-label q-mb-sm">Resumen de Caja</div>
          <div class="pc-summary-row">
            <span class="pc-caption">Monto inicial</span>
            <span>{{ formatCurrency(cajaStore.cajaActual?.montoInicial) }}</span>
          </div>
          <div class="pc-summary-row">
            <span class="pc-caption">+ Ventas efectivo</span>
            <span class="text-positive">{{ formatCurrency(cajaStore.cajaActual?.ventasEfectivo || 0) }}</span>
          </div>
          <div class="pc-summary-row">
            <span class="pc-caption">+ Ingresos</span>
            <span class="text-positive">{{ formatCurrency(cajaStore.cajaActual?.ingresos || 0) }}</span>
          </div>
          <div class="pc-summary-row">
            <span class="pc-caption">- Retiros</span>
            <span class="text-negative">{{ formatCurrency(cajaStore.cajaActual?.retiros || 0) }}</span>
          </div>
          <div class="pc-total-highlight">
            <span class="pc-body text-weight-bold text-dark">Total esperado</span>
            <span class="pc-subtitle text-primary">{{ formatCurrency(cajaStore.cajaEsperada) }}</span>
          </div>
        </div>

        <q-input
          v-model.number="formData.montoReal"
          outlined
          type="number"
          label="Dinero Contado *"
          prefix="$"
          hint="Ingrese el dinero real contado en caja"
          :rules="[val => val >= 0 || 'Monto no puede ser negativo']"
          :disable="loading"
          autofocus
        />

        <q-banner
          v-if="formData.montoReal !== null"
          :class="diferenciaClass"
          rounded
        >
          <template v-slot:avatar>
            <q-icon :name="diferenciaIcon" :color="diferenciaColor" />
          </template>
          <div class="text-caption text-grey-7">Diferencia</div>
          <div class="text-h5 text-weight-bold">{{ diferenciaFormateada }}</div>
        </q-banner>

        <q-input
          v-model="formData.observacion"
          outlined
          type="textarea"
          label="Observaciones de cierre"
          rows="2"
          :disable="loading"
        />
      </div>

      <div class="pc-modal-actions">
        <q-btn flat label="Cancelar" color="grey-6" v-close-popup :disable="loading" />
        <q-btn
          color="negative"
          label="Cerrar Caja"
          icon="lock"
          :disable="formData.montoReal == null || formData.montoReal < 0"
          :loading="loading"
          unelevated
          @click="cerrar"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCajaStore } from '@/store/cajaStore'
import { formatCurrency } from '@/common/format'

const emit = defineEmits(['cajaCerrada'])
const $q = useQuasar()
const cajaStore = useCajaStore()

const model = ref(false)
const loading = ref(false)

const formData = ref({ montoReal: null, observacion: '' })

const diferencia = computed(() => {
  if (formData.value.montoReal == null) return 0
  return formData.value.montoReal - cajaStore.cajaEsperada
})

const diferenciaFormateada = computed(() => {
  const d = diferencia.value
  return `${d > 0 ? '+' : ''}${formatCurrency(d)}`
})

const diferenciaColor = computed(() =>
  diferencia.value === 0 ? 'positive' : (Math.abs(diferencia.value) > 5000 ? 'negative' : 'warning')
)

const diferenciaClass = computed(() => {
  if (diferencia.value === 0) return 'bg-green-1'
  if (Math.abs(diferencia.value) > 5000) return 'bg-red-1'
  return 'bg-orange-1'
})

const diferenciaIcon = computed(() =>
  diferencia.value === 0 ? 'check_circle' : 'warning'
)

async function cerrar() {
  if (Math.abs(diferencia.value) > 5000) {
    $q.notify({
      type: 'warning',
      message: `Atención: Diferencia de ${diferenciaFormateada.value}. Verifique antes de cerrar.`,
      position: 'top',
      timeout: 5000
    })
  }
  loading.value = true
  try {
    await cajaStore.cerrarCaja({
      dineroReal: formData.value.montoReal,
      observaciones: formData.value.observacion
    })
    $q.notify({ type: 'positive', message: 'Caja cerrada exitosamente', position: 'top' })
    model.value = false
    emit('cajaCerrada')
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cerrar la caja', position: 'top' })
  } finally {
    loading.value = false
  }
}

function abrirModal() {
  formData.value = { montoReal: null, observacion: '' }
  model.value = true
}

defineExpose({ abrirModal })
</script>

<style scoped>
.resumen-caja {
  background: var(--pc-surface-variant);
  border-radius: var(--pc-radius-sm);
  border: 1px solid var(--pc-border);
}
</style>
