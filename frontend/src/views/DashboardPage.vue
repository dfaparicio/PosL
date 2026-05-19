<template>
  <MainLayout>
    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header row items-center justify-between">
        <div>
          <div class="page-title">Dashboard</div>
          <div class="page-subtitle">{{ fechaHoy }}</div>
        </div>
        <q-chip
          :color="cajaAbierta ? 'positive' : 'negative'"
          text-color="white"
          :icon="cajaAbierta ? 'lock_open' : 'lock'"
          :label="cajaAbierta ? 'Caja abierta' : 'Caja cerrada'"
        />
      </div>

      <!-- Métricas principales -->
      <SummaryCards class="q-mb-xl" />

      <!-- Fila 2: Estado caja + Últimas ventas (igual altura) -->
      <div class="row equal-height q-col-gutter-lg q-mb-xl">

        <!-- Estado de caja -->
        <div class="col-12 col-md-4">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#059669,#10B981)">
                <q-icon name="account_balance_wallet" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Estado de Caja</span>
            </div>

            <div class="pc-card-body full-card" style="justify-content:center">
              <!-- Cerrada -->
              <div v-if="!cajaAbierta" class="column items-center text-center q-gutter-y-lg q-py-lg">
                <div class="status-icon-circle negative-circle">
                  <q-icon name="lock" size="40px" color="negative" />
                </div>
                <div>
                  <div class="pc-subtitle text-dark">Caja cerrada</div>
                  <div class="pc-caption q-mt-xs">Abre la caja para registrar ventas</div>
                </div>
                <q-btn to="/caja" color="primary" label="Abrir Caja" icon="lock_open" unelevated rounded />
              </div>

              <!-- Abierta -->
              <div v-else class="q-gutter-y-md">
                <div class="text-center">
                  <div class="pc-caption q-mb-xs">Efectivo en caja</div>
                  <div class="pc-stat-value-lg text-positive">{{ formatCurrency(cajaEsperada) }}</div>
                </div>

                <div>
                  <div class="row justify-between q-mb-xs">
                    <span class="pc-caption">Meta diaria</span>
                    <span class="pc-caption text-weight-bold">{{ progressPercent }}%</span>
                  </div>
                  <q-linear-progress :value="progressValue" color="positive" track-color="grey-3" rounded size="10px" />
                </div>

                <div class="breakdown-box">
                  <div class="breakdown-row">
                    <span class="pc-caption">Monto inicial</span>
                    <span class="pc-body text-weight-medium">{{ formatCurrency(cajaActual?.montoInicial || 0) }}</span>
                  </div>
                  <div class="breakdown-row">
                    <span class="pc-caption">Ventas efectivo</span>
                    <span class="pc-body text-positive text-weight-medium">+{{ formatCurrency(cajaActual?.ventasEfectivo || 0) }}</span>
                  </div>
                  <div v-if="(cajaActual?.ingresos || 0) > 0" class="breakdown-row">
                    <span class="pc-caption">Ingresos extra</span>
                    <span class="pc-body text-positive text-weight-medium">+{{ formatCurrency(cajaActual.ingresos) }}</span>
                  </div>
                  <div v-if="(cajaActual?.retiros || 0) > 0" class="breakdown-row">
                    <span class="pc-caption">Retiros</span>
                    <span class="pc-body text-negative text-weight-medium">−{{ formatCurrency(cajaActual.retiros) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Últimas ventas -->
        <div class="col-12 col-md-8">
          <LastSalesTable class="full-card" />
        </div>
      </div>

      <!-- Fila 3: Timeline + Resumen del día -->
      <div class="row equal-height q-col-gutter-lg q-mb-xl">

        <div class="col-12 col-md-7">
          <CashTimeline class="full-card" />
        </div>

        <div class="col-12 col-md-5">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#4F46E5,#7C3AED)">
                <q-icon name="today" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Resumen del Día</span>
            </div>
            <div class="pc-card-body">
              <div class="summary-grid">
                <div class="summary-stat">
                  <div class="pc-stat-value-md text-primary">{{ ventasStore.ventasHoy.length }}</div>
                  <div class="pc-caption q-mt-xs">Ventas</div>
                </div>
                <div class="summary-stat">
                  <div class="pc-stat-value-md text-positive">{{ ventasStore.productosVendidosHoy }}</div>
                  <div class="pc-caption q-mt-xs">Artículos</div>
                </div>
                <div class="summary-stat">
                  <div class="pc-stat-value-md text-warning">{{ promoCount }}</div>
                  <div class="pc-caption q-mt-xs">Promociones</div>
                </div>
                <div class="summary-stat">
                  <div class="pc-stat-value-sm text-accent">{{ formatCurrency(ticketPromedio) }}</div>
                  <div class="pc-caption q-mt-xs">Ticket prom.</div>
                </div>
              </div>

              <!-- Top categorías -->
              <div v-if="topCategorias.length > 0" class="q-mt-lg">
                <div class="pc-label q-mb-sm">Top Categorías</div>
                <div class="top-cats">
                  <div v-for="(cat, i) in topCategorias" :key="cat.nombre" class="top-cat-item">
                    <div class="row items-center q-gutter-x-sm">
                      <div class="pc-rank-badge">{{ i + 1 }}</div>
                      <span class="pc-body text-weight-medium text-dark">{{ cat.nombre }}</span>
                    </div>
                    <div class="row items-center q-gutter-x-sm">
                      <span class="pc-caption">{{ cat.count }}×</span>
                      <span class="pc-body text-weight-bold text-primary">{{ formatCurrency(cat.total) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="column items-center q-py-md q-gutter-y-sm">
                <q-icon name="bar_chart" size="32px" color="grey-4" />
                <div class="pc-caption">Sin ventas hoy</div>
                <q-btn to="/ventas" color="primary" label="Registrar venta" unelevated rounded dense size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import SummaryCards from '@/components/Dashboard/SummaryCards.vue'
import LastSalesTable from '@/components/Dashboard/LastSalesTable.vue'
import CashTimeline from '@/components/Dashboard/CashTimeline.vue'
import { useCajaStore } from '@/store/cajaStore'
import { useVentasStore } from '@/store/ventasStore'
import { formatCurrency, formatDateLong } from '@/common/format'

const cajaStore = useCajaStore()
const ventasStore = useVentasStore()

const cajaAbierta = computed(() => cajaStore.cajaAbierta)
const cajaEsperada = computed(() => cajaStore.cajaEsperada)
const cajaActual  = computed(() => cajaStore.cajaActual)
const fechaHoy    = computed(() => formatDateLong(new Date()))

const progressValue = computed(() => {
  if (!cajaActual.value || !cajaAbierta.value) return 0
  const meta = (cajaActual.value.montoInicial || 0) * 3
  return meta === 0 ? 0 : Math.min(cajaEsperada.value / meta, 1)
})
const progressPercent = computed(() => Math.round(progressValue.value * 100))

const promoCount     = computed(() => ventasStore.ventasHoy.filter(v => v.esPromocion).length)
const ticketPromedio = computed(() => {
  const v = ventasStore.ventasHoy
  return v.length ? v.reduce((s, x) => s + (x.total || 0), 0) / v.length : 0
})
const topCategorias = computed(() => {
  const map = {}
  ventasStore.ventasHoy.forEach(v => {
    ;(v.items || []).forEach(item => {
      const c = item.categoria || 'Otro'
      if (!map[c]) map[c] = { nombre: c, count: 0, total: 0 }
      map[c].count += item.cantidad || 1
      map[c].total += item.subtotal || 0
    })
  })
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5)
})

onMounted(() => {
  cajaStore.cargarEstadoCaja()
  ventasStore.cargarVentas()
  ventasStore.cargarVentasRecientes()
})
</script>

<style scoped>
.status-icon-circle {
  width: 80px; height: 80px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.negative-circle { background: rgba(220,38,38,0.08); }

.breakdown-box {
  background: var(--pc-surface-variant);
  border-radius: var(--pc-radius-sm);
  border: 1px solid var(--pc-border);
  padding: 12px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.breakdown-row {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(79,70,229,0.06);
}
.breakdown-row:last-child { border-bottom: none; padding-bottom: 0; }

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--pc-border);
  border-radius: var(--pc-radius-sm);
  overflow: hidden;
  border: 1px solid var(--pc-border);
}
.summary-stat {
  background: var(--pc-surface);
  padding: 20px 16px;
  text-align: center;
}

.top-cats { display: flex; flex-direction: column; gap: 8px; }
.top-cat-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px;
  background: var(--pc-surface-variant);
  border-radius: 8px;
  border: 1px solid var(--pc-border);
}
</style>
