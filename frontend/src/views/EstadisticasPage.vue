<template>
  <MainLayout>
    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header row items-center justify-between">
        <div>
          <div class="page-title">Estadísticas</div>
          <div class="page-subtitle">Análisis detallado de ventas y rendimiento</div>
        </div>
        <div class="row q-gutter-x-sm">
          <q-chip dense color="grey-2" text-color="dark" icon="event">
            Todo el historial
          </q-chip>
        </div>
      </div>

      <!-- Métricas de resumen (3 tarjetas) -->
      <div class="row equal-height q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-4">
          <div class="pc-card full-card">
            <div class="pc-card-body text-center">
              <div class="stat-icon-wrap" style="background:rgba(79,70,229,0.1)">
                <q-icon name="receipt_long" size="24px" color="primary" />
              </div>
              <div class="pc-stat-value-lg text-primary q-mt-sm">{{ totalVentas }}</div>
              <div class="pc-caption q-mt-xs">Total ventas</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-4">
          <div class="pc-card full-card">
            <div class="pc-card-body text-center">
              <div class="stat-icon-wrap" style="background:rgba(5,150,105,0.1)">
                <q-icon name="trending_up" size="24px" color="positive" />
              </div>
              <div class="pc-stat-value-lg text-positive q-mt-sm">{{ formatCurrency(ventasStore.totalVentasDia) }}</div>
              <div class="pc-caption q-mt-xs">Ingresos del día</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-4">
          <div class="pc-card full-card">
            <div class="pc-card-body text-center">
              <div class="stat-icon-wrap" style="background:rgba(217,119,6,0.1)">
                <q-icon name="local_offer" size="24px" color="warning" />
              </div>
              <div class="pc-stat-value-lg text-warning q-mt-sm">{{ totalPromo }}</div>
              <div class="pc-caption q-mt-xs">En promoción</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts fila 1 -->
      <div class="row equal-height q-col-gutter-lg q-mb-xl">

        <!-- Ventas por hora -->
        <div class="col-12 col-md-7">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#4F46E5,#7C3AED)">
                <q-icon name="show_chart" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Ventas por Hora del Día</span>
              <q-space />
              <q-badge color="primary" :label="`${totalVentas} ventas`" outline />
            </div>
            <div class="pc-card-body">
              <Line
                v-if="ventasPorHoraData.datasets[0].data.some(d => d > 0)"
                :data="ventasPorHoraData"
                :options="lineOptions"
                style="height:280px"
              />
              <EmptyState v-else icon="show_chart" title="Sin ventas" message="Registra ventas para ver esta gráfica" action-label="Ir a Ventas" action-to="/ventas" />
            </div>
          </div>
        </div>

        <!-- Métodos de pago -->
        <div class="col-12 col-md-5">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#0D9488,#2DD4BF)">
                <q-icon name="donut_large" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Métodos de Pago</span>
            </div>
            <div class="pc-card-body">
              <Doughnut
                v-if="metodosPagoData.datasets[0].data.some(d => d > 0)"
                :data="metodosPagoData"
                :options="doughnutOptions"
                style="height:280px"
              />
              <EmptyState v-else icon="pie_chart" title="Sin datos" message="No hay ventas registradas" />
            </div>
          </div>
        </div>
      </div>

      <!-- Charts fila 2 -->
      <div class="row equal-height q-col-gutter-lg q-mb-xl">

        <!-- Top categorías (barras horizontales) -->
        <div class="col-12 col-md-6">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#D97706,#FBBF24)">
                <q-icon name="category" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Top Categorías por Monto</span>
            </div>
            <div class="pc-card-body">
              <div v-if="topCategorias.length > 0" class="cat-bars">
                <div v-for="(cat, i) in topCategorias" :key="cat.nombre" class="cat-bar-row">
                  <div class="row items-center q-mb-xs">
                    <div class="pc-rank-badge q-mr-sm">{{ i + 1 }}</div>
                    <span class="pc-body text-weight-medium text-dark">{{ cat.nombre }}</span>
                    <q-space />
                    <span class="pc-body text-weight-bold text-primary">{{ formatCurrency(cat.total) }}</span>
                    <span class="pc-caption q-ml-sm text-grey-5">{{ cat.count }}×</span>
                  </div>
                  <q-linear-progress
                    :value="maxCatTotal > 0 ? cat.total / maxCatTotal : 0"
                    :color="catColors[i % catColors.length]"
                    track-color="grey-2"
                    rounded size="8px"
                  />
                </div>
              </div>
              <EmptyState v-else icon="category" title="Sin categorías" message="Registra ventas para ver el ranking" />
            </div>
          </div>
        </div>

        <!-- Ventas vs Promociones -->
        <div class="col-12 col-md-6">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#DC2626,#F87171)">
                <q-icon name="bar_chart" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Ventas por Método</span>
            </div>
            <div class="pc-card-body">
              <Bar
                v-if="ventasPorMetodoData.datasets[0].data.some(d => d > 0)"
                :data="ventasPorMetodoData"
                :options="barOptions"
                style="height:280px"
              />
              <EmptyState v-else icon="bar_chart" title="Sin datos" message="No hay ventas para graficar" />
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen caja -->
      <div class="row equal-height q-col-gutter-lg">
        <div class="col-12 col-md-4">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#059669,#10B981)">
                <q-icon name="summarize" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Balance de Caja</span>
            </div>
            <div class="pc-card-body q-gutter-y-md">
              <div class="balance-row">
                <span class="pc-body text-grey-6">Monto inicial</span>
                <span class="pc-body text-weight-bold">{{ formatCurrency(montoInicial) }}</span>
              </div>
              <div class="balance-row">
                <span class="pc-body text-positive">+ Ventas efectivo</span>
                <span class="pc-body text-weight-bold text-positive">{{ formatCurrency(ventasEfectivo) }}</span>
              </div>
              <div class="balance-row">
                <span class="pc-body text-positive">+ Ingresos extras</span>
                <span class="pc-body text-weight-bold text-positive">{{ formatCurrency(totalIngresos) }}</span>
              </div>
              <div class="balance-row">
                <span class="pc-body text-negative">− Retiros</span>
                <span class="pc-body text-weight-bold text-negative">{{ formatCurrency(totalRetiros) }}</span>
              </div>
              <div class="balance-total row items-center justify-between">
                <span class="pc-body text-weight-bold text-dark">Total esperado</span>
                <span class="pc-subtitle text-primary">{{ formatCurrency(cajaEsperada) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-8">
          <div class="pc-card full-card">
            <div class="pc-card-header">
              <div class="pc-icon-box" style="background:linear-gradient(135deg,#0284C7,#38BDF8)">
                <q-icon name="local_offer" size="16px" color="white" />
              </div>
              <span class="pc-card-title">Ventas en Promoción vs. Normales</span>
            </div>
            <div class="pc-card-body">
              <div class="row items-center q-gutter-x-xl">
                <div class="text-center">
                  <div class="promo-circle promo-circle--warning">
                    <div class="pc-stat-value-lg text-warning">{{ totalPromo }}</div>
                  </div>
                  <div class="pc-caption q-mt-sm">En promoción</div>
                  <div class="pc-body text-weight-bold text-warning">{{ formatCurrency(montoPromo) }}</div>
                </div>
                <div class="text-center">
                  <div class="promo-circle promo-circle--primary">
                    <div class="pc-stat-value-lg text-primary">{{ totalNormal }}</div>
                  </div>
                  <div class="pc-caption q-mt-sm">Precio normal</div>
                  <div class="pc-body text-weight-bold text-primary">{{ formatCurrency(montoNormal) }}</div>
                </div>
                <div class="col q-ml-xl">
                  <div class="pc-label q-mb-sm">% de ventas en promo</div>
                  <q-linear-progress
                    :value="totalVentas > 0 ? totalPromo / totalVentas : 0"
                    color="warning"
                    track-color="grey-2"
                    rounded size="12px"
                    class="q-mb-xs"
                  />
                  <div class="pc-caption">{{ totalVentas > 0 ? Math.round(totalPromo / totalVentas * 100) : 0 }}% del total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { computed } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement,
  CategoryScale, LinearScale, ArcElement, PointElement, LineElement
} from 'chart.js'
import MainLayout from '@/layouts/MainLayout.vue'
import EmptyState from '@/components/Shared/EmptyState.vue'
import { useVentasStore } from '@/store/ventasStore'
import { useCajaStore } from '@/store/cajaStore'
import { formatCurrency } from '@/common/format'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement)

const ventasStore = useVentasStore()
const cajaStore   = useCajaStore()

const ventas = computed(() => ventasStore.ventas || [])

const totalVentas = computed(() => ventas.value.length)
const totalMonto  = computed(() => ventas.value.reduce((s, v) => s + (v.total || 0), 0))
const totalPromo  = computed(() => ventas.value.filter(v => v.esPromocion).length)
const totalNormal = computed(() => totalVentas.value - totalPromo.value)
const montoPromo  = computed(() => ventas.value.filter(v => v.esPromocion).reduce((s, v) => s + (v.total || 0), 0))
const montoNormal = computed(() => totalMonto.value - montoPromo.value)

const cajaEsperada    = computed(() => cajaStore.cajaEsperada)
const montoInicial    = computed(() => cajaStore.cajaActual?.montoInicial || 0)
const ventasEfectivo  = computed(() => cajaStore.cajaActual?.ventasEfectivo || 0)
const totalIngresos   = computed(() => (cajaStore.movimientos || []).filter(m => m.tipo === 'ingreso').reduce((s, m) => s + (m.valor || 0), 0))
const totalRetiros    = computed(() => (cajaStore.movimientos || []).filter(m => m.tipo === 'retiro').reduce((s, m) => s + (m.valor || 0), 0))

const topCategorias = computed(() => {
  const map = {}
  ventas.value.forEach(v => {
    ;(v.items || []).forEach(item => {
      const c = item.categoria || 'Otro'
      if (!map[c]) map[c] = { nombre: c, count: 0, total: 0 }
      map[c].count += item.cantidad || 1
      map[c].total += item.subtotal || 0
    })
  })
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 7)
})
const maxCatTotal = computed(() => topCategorias.value[0]?.total || 1)
const catColors = ['primary', 'secondary', 'accent', 'positive', 'warning', 'info', 'negative']

const COLORS = { primary: '#4F46E5', positive: '#059669', info: '#0284C7', accent: '#7C3AED', warning: '#D97706' }

const ventasPorMetodoPago = computed(() => ventasStore.ventasPorMetodoPago)

const ventasPorMetodoData = computed(() => ({
  labels: ['Efectivo', 'Transferencia', 'Tarjeta'],
  datasets: [{
    label: 'Total',
    data: [ventasPorMetodoPago.value.efectivo, ventasPorMetodoPago.value.transferencia, ventasPorMetodoPago.value.tarjeta],
    backgroundColor: [COLORS.positive, COLORS.info, COLORS.accent],
    borderRadius: 8, borderSkipped: false
  }]
}))

const metodosPagoData = computed(() => ({
  labels: ['Efectivo', 'Transferencia', 'Tarjeta'],
  datasets: [{
    data: [ventasPorMetodoPago.value.efectivo, ventasPorMetodoPago.value.transferencia, ventasPorMetodoPago.value.tarjeta],
    backgroundColor: [COLORS.positive, COLORS.info, COLORS.accent],
    borderWidth: 3, borderColor: '#fff', hoverOffset: 8
  }]
}))

const ventasPorHoraData = computed(() => {
  const hrs = new Array(24).fill(0)
  ventas.value.forEach(v => {
    if (v.hora) {
      const h = parseInt(v.hora.split(':')[0])
      if (h >= 0 && h < 24) hrs[h] += v.total || 0
    }
  })
  return {
    labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
    datasets: [{
      label: 'Ventas',
      data: hrs,
      borderColor: COLORS.primary,
      backgroundColor: 'rgba(79,70,229,0.08)',
      fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6,
      pointBackgroundColor: COLORS.primary
    }]
  }
})

const fontCfg = { font: { family: "'Inter', system-ui, sans-serif", size: 12 } }

const chartCommonOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, ...fontCfg } },
    tooltip: { ...fontCfg }
  }
}

const barOptions = {
  ...chartCommonOptions,
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(79,70,229,0.06)' }, ticks: { callback: v => formatCurrency(v), ...fontCfg } },
    x: { grid: { display: false }, ticks: { ...fontCfg } }
  }
}

const lineOptions = {
  ...chartCommonOptions,
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(79,70,229,0.06)' }, ticks: { callback: v => formatCurrency(v), ...fontCfg } },
    x: { grid: { display: false }, ticks: { ...fontCfg } }
  }
}

const doughnutOptions = { ...chartCommonOptions, cutout: '62%' }
</script>

<style scoped>
.stat-icon-wrap {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto;
}

.cat-bars { display: flex; flex-direction: column; gap: 16px; }

.pc-icon-box {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}

/* Cat bars */
.cat-bars { display: flex; flex-direction: column; gap: 16px; }
.cat-bar-row {}
/* ── Badge de ranking (11px / 800 primary) ── */
.rank-badge {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(79,70,229,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--pc-text-3xs); font-weight: var(--pc-weight-extra); color: var(--q-primary);
}

/* Balance */
.balance-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(79,70,229,0.06);
}
.balance-row:last-of-type { border-bottom: none; }
.balance-total {
  background: rgba(79,70,229,0.05);
  border-radius: 10px;
  border: 1.5px solid rgba(79,70,229,0.15);
  padding: 12px 16px;
  margin-top: 8px;
}

/* Promo circles */
.promo-circle {
  width: 80px; height: 80px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto;
}
.promo-circle--warning { background: rgba(217,119,6,0.1); border: 2px solid rgba(217,119,6,0.3); }
.promo-circle--primary { background: rgba(79,70,229,0.08); border: 2px solid rgba(79,70,229,0.2); }
</style>
