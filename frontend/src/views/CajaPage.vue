<template>
  <MainLayout>
    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header row items-center justify-between">
        <div>
          <div class="page-title">Control de Caja</div>
          <div class="page-subtitle">{{ fechaHoy }}</div>
        </div>
        <q-chip
          :color="cajaAbierta ? 'positive' : 'negative'"
          text-color="white"
          :icon="cajaAbierta ? 'lock_open' : 'lock'"
          :label="cajaAbierta ? 'Caja Abierta' : 'Caja Cerrada'"
        />
      </div>

      <div class="row q-col-gutter-md q-mb-md">

        <!-- Card estado principal -->
        <div class="col-12 col-md-4">
          <div class="pc-card caja-status-card" :class="cajaAbierta ? 'status-open' : 'status-closed'">
            <div class="column items-center q-pa-lg q-gutter-y-sm text-center">
              <div class="status-icon-wrap" :class="cajaAbierta ? 'wrap-open' : 'wrap-closed'">
                <q-icon :name="cajaAbierta ? 'lock_open' : 'lock'" size="36px" :color="cajaAbierta ? 'positive' : 'negative'" />
              </div>
              <div class="text-h3 text-weight-bold" :class="cajaAbierta ? 'text-positive' : 'text-negative'">
                {{ formatCurrency(cajaEsperada) }}
              </div>
              <div class="text-caption text-grey-6">Efectivo esperado en caja</div>
              <div v-if="fechaApertura" class="text-caption text-grey-5">
                Apertura: {{ formatDateFriendly(fechaApertura) }}
              </div>
              <div v-if="cajaAbierta && cajaActual?.montoInicial != null" class="breakdown-mini q-mt-xs full-width">
                <div class="row justify-between text-caption">
                  <span class="text-grey-6">Inicial</span>
                  <span>{{ formatCurrency(cajaActual.montoInicial) }}</span>
                </div>
                <div class="row justify-between text-caption">
                  <span class="text-grey-6">Ventas efectivo</span>
                  <span class="text-positive">+{{ formatCurrency(cajaActual.ventasEfectivo || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones + métricas -->
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-md full-height">

            <!-- Acciones -->
            <div class="col-12">
              <div class="pc-card">
                <div class="card-section-header">
                  <q-icon name="touch_app" size="16px" color="primary" />
                  <span class="text-caption text-weight-bold text-grey-7 text-uppercase">Acciones</span>
                </div>
                <div class="q-pa-md">
                  <div class="actions-grid">
                    <q-btn
                      color="positive" icon="lock_open" label="Abrir Caja"
                      :disable="cajaAbierta" unelevated class="action-btn"
                      @click="openCashRef?.abrirModal()"
                    />
                    <q-btn
                      color="primary" icon="add_circle_outline" label="Ingreso"
                      :disable="!cajaAbierta" unelevated class="action-btn"
                      @click="cashMovRef?.abrirModal('ingreso')"
                    />
                    <q-btn
                      color="warning" icon="remove_circle_outline" label="Retiro"
                      :disable="!cajaAbierta" unelevated class="action-btn"
                      @click="cashMovRef?.abrirModal('retiro')"
                    />
                    <q-btn
                      color="negative" icon="lock" label="Cerrar Caja"
                      :disable="!cajaAbierta" unelevated class="action-btn"
                      @click="closeCashRef?.abrirModal()"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Métricas rápidas -->
            <div class="col-12">
              <div class="row q-col-gutter-sm">
                <div class="col-6 col-sm-3">
                  <div class="metric-card">
                    <q-icon name="arrow_upward" size="18px" color="positive" />
                    <div class="text-caption text-grey-6 q-mt-xs">Ingresos</div>
                    <div class="text-subtitle2 text-weight-bold text-positive">{{ formatCurrency(totalIngresos) }}</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="metric-card">
                    <q-icon name="arrow_downward" size="18px" color="negative" />
                    <div class="text-caption text-grey-6 q-mt-xs">Retiros</div>
                    <div class="text-subtitle2 text-weight-bold text-negative">{{ formatCurrency(totalRetiros) }}</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="metric-card">
                    <q-icon name="receipt_long" size="18px" color="primary" />
                    <div class="text-caption text-grey-6 q-mt-xs">Movimientos</div>
                    <div class="text-subtitle2 text-weight-bold text-dark">{{ movimientosCount }}</div>
                  </div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="metric-card">
                    <q-icon name="trending_up" size="18px" color="accent" />
                    <div class="text-caption text-grey-6 q-mt-xs">Balance neto</div>
                    <div class="text-subtitle2 text-weight-bold" :class="balanceNeto >= 0 ? 'text-positive' : 'text-negative'">
                      {{ formatCurrency(balanceNeto) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Tabla de movimientos -->
      <CashHistoryTable />

      <OpenCashModal ref="openCashRef" @cajaAbierta="onCajaActualizada" :monto-sugerido="montoSugerido" />
      <CashMovementModal ref="cashMovRef" @movimientoRegistrado="onCajaActualizada" />
      <CloseCashModal ref="closeCashRef" @cajaCerrada="onCajaActualizada" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import CashHistoryTable from '@/components/Caja/CashHistoryTable.vue'
import OpenCashModal from '@/components/Caja/OpenCashModal.vue'
import CashMovementModal from '@/components/Caja/CashMovementModal.vue'
import CloseCashModal from '@/components/Caja/CloseCashModal.vue'
import { useCajaStore } from '@/store/cajaStore'
import { formatCurrency, formatDateFriendly, formatDateLong } from '@/common/format'

const cajaStore = useCajaStore()
const openCashRef = ref(null)
const cashMovRef = ref(null)
const closeCashRef = ref(null)

const cajaAbierta = computed(() => cajaStore.cajaAbierta)
const cajaActual = computed(() => cajaStore.cajaActual)
const cajaEsperada = computed(() => cajaStore.cajaEsperada)
const fechaApertura = computed(() => cajaStore.fechaApertura)
const fechaHoy = computed(() => formatDateLong(new Date()))

// Sugerencia de monto al abrir: el dinero real contado en el último cierre
// Si no hay cierre previo, sugiere 0 (el usuario ingresa libremente)
const montoSugerido = computed(() => {
  if (cajaAbierta.value) return 0
  return cajaActual.value?.dineroReal ?? cajaActual.value?.efectivoEsperado ?? 0
})

const totalIngresos = computed(() =>
  (cajaStore.movimientos || []).filter(m => m.tipo === 'ingreso').reduce((s, m) => s + (m.valor || 0), 0)
)

const totalRetiros = computed(() =>
  (cajaStore.movimientos || []).filter(m => m.tipo === 'retiro').reduce((s, m) => s + (m.valor || 0), 0)
)

const balanceNeto = computed(() => totalIngresos.value - totalRetiros.value)
const movimientosCount = computed(() => cajaStore.movimientos?.length || 0)

function onCajaActualizada() {
  cajaStore.cargarEstadoCaja()
}

onMounted(() => { cajaStore.cargarEstadoCaja() })
</script>

<style scoped>
.caja-status-card {
  height: 100%;
  transition: border-color 0.3s;
}
.status-open  { border: 2px solid var(--q-positive) !important; }
.status-closed { border: 2px solid var(--q-negative) !important; }

.status-icon-wrap {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.wrap-open  { background: rgba(5,150,105,0.10); }
.wrap-closed { background: rgba(220,38,38,0.10); }

.breakdown-mini {
  background: rgba(79,70,229,0.05);
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid var(--pc-border);
}

.card-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--pc-border);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

@media (max-width: 600px) {
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

.action-btn {
  height: 52px;
  border-radius: 10px !important;
  font-weight: var(--pc-weight-bold);
  font-size: var(--pc-text-xs);
}

.metric-card {
  background: var(--pc-surface);
  border: 1px solid var(--pc-border);
  border-radius: var(--pc-radius-sm);
  padding: 10px 12px;
  text-align: center;
  box-shadow: var(--pc-shadow-sm);
}
</style>
