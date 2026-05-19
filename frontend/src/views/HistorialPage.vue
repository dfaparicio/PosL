<template>
  <MainLayout>
    <div class="page-wrapper">

      <!-- ─── Header ──────────────────────────────────────────── -->
      <div class="page-header row items-center justify-between">
        <div>
          <div class="page-title">Historial</div>
          <div class="page-subtitle">Registro completo de ventas y movimientos de caja</div>
        </div>
        <div class="row q-gutter-x-sm">
          <div class="stat-pill stat-pill--blue">
            <q-icon name="receipt_long" size="16px" />
            <span>{{ ventasStore.ventas.length }} ventas</span>
          </div>
          <div class="stat-pill stat-pill--teal">
            <q-icon name="swap_horiz" size="16px" />
            <span>{{ movimientosHistorial.length }} movimientos</span>
          </div>
        </div>
      </div>

      <!-- ─── Panel de filtros ─────────────────────────────────── -->
      <div class="pc-card q-mb-lg filter-panel">
        <div class="filter-panel-header">
          <q-icon name="filter_list" size="18px" color="primary" />
          <span class="filter-panel-title">Filtrar resultados</span>
          <q-space />
          <q-btn
            v-if="hayFiltrosActivos"
            flat dense no-caps color="negative" icon="clear" label="Limpiar filtros"
            size="sm" @click="limpiarFiltros"
          />
        </div>

        <div class="filter-panel-body">
          <!-- Fila 1: Fechas -->
          <div class="filter-group">
            <div class="filter-group-label">
              <q-icon name="event" size="14px" color="grey-6" />
              Período
            </div>
            <div class="filter-group-inputs">
              <q-input
                v-model="filtros.fecha"
                outlined dense type="date" label="Fecha exacta" clearable
                class="filter-input"
              />
              <q-input
                v-model="filtros.fechaDesde"
                outlined dense type="date" label="Desde" clearable
                class="filter-input"
                :disable="!!filtros.fecha"
              />
              <q-input
                v-model="filtros.fechaHasta"
                outlined dense type="date" label="Hasta" clearable
                class="filter-input"
                :disable="!!filtros.fecha"
              />
            </div>
          </div>

          <!-- Separador vertical -->
          <div class="filter-divider" />

          <!-- Fila 2: Tipo / Método / Búsqueda -->
          <div class="filter-group">
            <div class="filter-group-label">
              <q-icon name="tune" size="14px" color="grey-6" />
              Filtros adicionales
            </div>
            <div class="filter-group-inputs">
              <q-input
                v-model="filtros.busqueda"
                outlined dense clearable
                placeholder="Buscar categoría o referencia..."
                class="filter-input filter-input--wide"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="grey-5" size="18px" />
                </template>
              </q-input>
              <q-select
                v-model="filtros.metodoPago"
                outlined dense clearable emit-value map-options
                :options="opcionesMetodo"
                label="Método de pago"
                class="filter-input"
              />
              <q-select
                v-model="filtros.esPromocion"
                outlined dense clearable emit-value map-options
                :options="opcionesPromo"
                label="Promoción"
                class="filter-input"
              />
            </div>
          </div>
        </div>

        <!-- Resultado del filtro -->
        <div v-if="hayFiltrosActivos" class="filter-result-bar">
          <q-icon name="info" size="14px" color="primary" />
          <span>
            Mostrando
            <strong>{{ ventasFiltradas.length }}</strong> ventas
            y <strong>{{ movimientosFiltrados.length }}</strong> movimientos
          </span>
        </div>
      </div>

      <!-- ─── Tabs principales ─────────────────────────────────── -->
      <div class="pc-card">

        <!-- Tab selector grande -->
        <div class="big-tabs">
          <button
            v-for="t in tabs"
            :key="t.value"
            class="big-tab"
            :class="{ 'big-tab--active': tab === t.value }"
            @click="tab = t.value"
          >
            <div class="big-tab-icon">
              <q-icon :name="t.icon" size="22px" />
            </div>
            <div class="big-tab-text">
              <div class="big-tab-label">{{ t.label }}</div>
              <div class="big-tab-count">{{ t.count.value }}</div>
            </div>
          </button>
        </div>

        <div class="tab-divider" />

        <!-- ── Tab: Ventas ──────────────────────────────────────── -->
        <div v-if="tab === 'ventas'" class="tab-panel">
          <q-table
            :rows="ventasFiltradas"
            :columns="columnasVentas"
            row-key="id"
            flat
            :pagination="pagination"
            :rows-per-page-options="[10, 20, 50]"
            class="hist-table"
          >
            <!-- Fecha -->
            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                <div class="date-cell">
                  <div class="date-day">{{ new Date((props.value || '').substring(0, 10) + 'T12:00').getDate() }}</div>
                  <div class="date-info">
                    <div class="date-main">{{ formatDateShort((props.value || '').substring(0, 10) + 'T12:00') }}</div>
                    <div class="date-friendly">{{ formatDateFriendly((props.value || '').substring(0, 10) + 'T12:00') }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Hora -->
            <template v-slot:body-cell-hora="props">
              <q-td :props="props">
                <span class="time-chip">{{ props.value }}</span>
              </q-td>
            </template>

            <!-- Productos (ítems de la venta) -->
            <template v-slot:body-cell-productos="props">
              <q-td :props="props">
                <div class="items-tags">
                  <span
                    v-for="(item, i) in (props.row.items || []).slice(0, 2)"
                    :key="i"
                    class="item-tag-sm"
                  >
                    {{ item.categoria }}<span v-if="item.referencia" class="item-ref-sm"> · {{ item.referencia }}</span>
                  </span>
                  <span v-if="(props.row.items?.length || 0) > 2" class="item-more-sm">
                    +{{ props.row.items.length - 2 }}
                  </span>
                  <q-badge v-if="props.row.esPromocion" color="warning" text-color="white" label="PROMO" class="q-ml-xs" />
                </div>
              </q-td>
            </template>

            <!-- Total artículos -->
            <template v-slot:body-cell-cantidadTotal="props">
              <q-td :props="props" class="text-center">
                <div class="qty-badge">{{ props.value }}</div>
              </q-td>
            </template>

            <!-- Total -->
            <template v-slot:body-cell-total="props">
              <q-td :props="props" class="text-right">
                <div class="total-cell">{{ formatCurrency(props.value) }}</div>
              </q-td>
            </template>

            <!-- Método -->
            <template v-slot:body-cell-metodoPago="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  :color="chipColor(props.value)"
                  text-color="white"
                  :label="metodoLabel(props.value)"
                  class="metodo-badge"
                />
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width q-pa-xl">
                <EmptyState icon="receipt_long" title="Sin ventas" message="No hay ventas con los filtros seleccionados" action-label="Limpiar filtros" :action-fn="limpiarFiltros" />
              </div>
            </template>
          </q-table>
        </div>

        <!-- ── Tab: Movimientos ─────────────────────────────────── -->
        <div v-if="tab === 'movimientos'" class="tab-panel">
          <q-table
            :rows="movimientosFiltrados"
            :columns="columnasMovimientos"
            row-key="id"
            flat
            :pagination="pagination"
            :rows-per-page-options="[10, 20, 50]"
            class="hist-table"
          >
            <!-- Fecha -->
            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                <div class="date-cell">
                  <div class="date-day">{{ new Date(props.value).getDate() }}</div>
                  <div class="date-info">
                    <div class="date-main">{{ formatDateShort(props.value) }}</div>
                    <div class="date-friendly">{{ formatTime(props.value) }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Tipo -->
            <template v-slot:body-cell-tipo="props">
              <q-td :props="props" class="text-center">
                <div class="tipo-cell" :class="`tipo-cell--${props.value}`">
                  <q-icon
                    :name="props.value === 'ingreso' ? 'arrow_upward' : 'arrow_downward'"
                    size="16px"
                    :color="props.value === 'ingreso' ? 'positive' : 'negative'"
                  />
                  <span>{{ props.value === 'ingreso' ? 'Ingreso' : 'Retiro' }}</span>
                </div>
              </q-td>
            </template>

            <!-- Valor -->
            <template v-slot:body-cell-valor="props">
              <q-td :props="props" class="text-right">
                <div class="valor-cell" :class="props.row.tipo === 'ingreso' ? 'valor-pos' : 'valor-neg'">
                  {{ props.row.tipo === 'ingreso' ? '+' : '−' }}{{ formatCurrency(props.value) }}
                </div>
              </q-td>
            </template>

            <!-- Motivo -->
            <template v-slot:body-cell-motivo="props">
              <q-td :props="props">
                <div class="motivo-cell">{{ props.value || '—' }}</div>
              </q-td>
            </template>

            <!-- Observación -->
            <template v-slot:body-cell-observacion="props">
              <q-td :props="props">
                <div class="obs-cell">{{ props.value || '—' }}</div>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width q-pa-xl">
                <EmptyState icon="account_balance" title="Sin movimientos" message="No hay movimientos de caja registrados" />
              </div>
            </template>
          </q-table>
        </div>

        <!-- ── Tab: Resumen diario ───────────────────────────────── -->
        <div v-if="tab === 'resumen'" class="tab-panel q-pa-lg">

          <div v-if="diasResumen.length === 0" class="q-py-xl">
            <EmptyState icon="history" title="Sin historial" message="No hay datos para el período seleccionado" action-label="Limpiar filtros" :action-fn="limpiarFiltros" />
          </div>

          <div v-else class="resumen-list">
            <div
              v-for="dia in diasResumen"
              :key="dia.fecha"
              class="dia-card"
            >
              <!-- Header del día — siempre visible -->
              <div class="dia-header" @click="dia.expanded = !dia.expanded">
                <!-- Badge fecha -->
                <div class="dia-fecha-badge">
                  <div class="dia-num">{{ new Date((dia.fecha || '').substring(0, 10) + 'T12:00').getDate() }}</div>
                  <div class="dia-mes">{{ new Date((dia.fecha || '').substring(0, 10) + 'T12:00').toLocaleDateString('es-CO', { month: 'short' }) }}</div>
                </div>

                <!-- Título y subtítulo -->
                <div class="dia-info">
                  <div class="dia-title">{{ formatDateFriendly((dia.fecha || '').substring(0, 10) + 'T12:00') }}</div>
                  <div class="dia-sub">{{ formatDateLong((dia.fecha || '').substring(0, 10) + 'T12:00') }}</div>
                </div>

                <!-- Métricas inline (centradas) -->
                <div class="dia-metrics">
                  <div class="dia-metric">
                    <div class="dia-metric-val text-primary">{{ formatCurrency(dia.totalMonto) }}</div>
                    <div class="dia-metric-lab">Total ventas</div>
                  </div>
                  <div class="dia-metric-sep" />
                  <div class="dia-metric">
                    <div class="dia-metric-val text-positive">{{ formatCurrency(dia.efectivo) }}</div>
                    <div class="dia-metric-lab">Efectivo</div>
                  </div>
                  <div class="dia-metric-sep" />
                  <div class="dia-metric">
                    <div class="dia-metric-val text-info">{{ formatCurrency(dia.transferencia) }}</div>
                    <div class="dia-metric-lab">Transferencia</div>
                  </div>
                  <div class="dia-metric-sep" />
                  <div class="dia-metric">
                    <div class="dia-metric-val text-accent">{{ formatCurrency(dia.tarjeta) }}</div>
                    <div class="dia-metric-lab">Tarjeta</div>
                  </div>
                  <div class="dia-metric-sep" />
                  <div class="dia-metric">
                    <div class="dia-metric-val text-dark">{{ dia.totalVentas }}</div>
                    <div class="dia-metric-lab">Artículos</div>
                  </div>
                </div>

                <!-- Toggle -->
                <div class="dia-toggle">
                  <q-icon
                    :name="dia.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                    size="24px" color="grey-5"
                  />
                </div>
              </div>

              <!-- Barrita de métodos de pago -->
              <div v-if="dia.totalMonto > 0" class="dia-bar">
                <div
                  class="dia-bar-segment dia-bar--efectivo"
                  :style="{ width: (dia.efectivo / dia.totalMonto * 100) + '%' }"
                />
                <div
                  class="dia-bar-segment dia-bar--transferencia"
                  :style="{ width: (dia.transferencia / dia.totalMonto * 100) + '%' }"
                />
                <div
                  class="dia-bar-segment dia-bar--tarjeta"
                  :style="{ width: (dia.tarjeta / dia.totalMonto * 100) + '%' }"
                />
              </div>

              <!-- Detalle expandido -->
              <transition name="expand">
                <div v-if="dia.expanded" class="dia-body">

                  <!-- Lista de ventas del día -->
                  <div class="pc-label q-mb-md">Ventas del día ({{ dia.ventas.length }})</div>

                  <div v-if="dia.ventas.length > 0" class="venta-tabla">
                    <!-- Cabecera -->
                    <div class="venta-tabla-header">
                      <span>Hora</span>
                      <span>Productos</span>
                      <span class="text-center">Arts.</span>
                      <span class="text-right">Total</span>
                      <span class="text-center">Método</span>
                    </div>
                    <!-- Filas -->
                    <div
                      v-for="v in dia.ventas"
                      :key="v.id"
                      class="venta-tabla-row"
                    >
                      <span class="time-chip">{{ v.hora }}</span>
                      <div class="cat-cell-sm">
                        <span
                          v-for="(item, i) in (v.items || []).slice(0, 2)"
                          :key="i"
                          class="cat-name"
                        >{{ item.categoria }}<span v-if="i < Math.min((v.items?.length || 1), 2) - 1"> · </span></span>
                        <span v-if="(v.items?.length || 0) > 2" class="cat-ref"> +{{ v.items.length - 2 }}</span>
                        <q-badge v-if="v.esPromocion" color="warning" text-color="white" label="PROMO" dense />
                      </div>
                      <span class="text-center qty-badge">{{ v.cantidadTotal || 0 }}</span>
                      <span class="text-right total-cell">{{ formatCurrency(v.total) }}</span>
                      <span class="text-center">
                        <q-badge :color="chipColor(v.metodoPago)" text-color="white" :label="metodoLabel(v.metodoPago)" />
                      </span>
                    </div>
                  </div>
                  <div v-else class="pc-caption text-grey-5 q-py-sm">Sin ventas registradas</div>

                </div>
              </transition>

            </div>
          </div>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import EmptyState from '@/components/Shared/EmptyState.vue'
import { useVentasStore } from '@/store/ventasStore'
import { useCajaStore } from '@/store/cajaStore'
import { obtenerHistorialCompleto } from '@/services/historialService'
import {
  formatCurrency, formatDateShort, formatDateLong,
  formatDateFriendly, formatTime
} from '@/common/format'
import { METODOS_PAGO_LABELS, METODOS_PAGO_CHIPS, METODOS_PAGO_OPTIONS } from '@/constants'

const ventasStore = useVentasStore()
const cajaStore   = useCajaStore()
const movimientosHistorial = ref([])

const tab = ref('ventas')
const pagination = ref({ rowsPerPage: 15, sortBy: 'fecha', descending: true })

const opcionesMetodo = METODOS_PAGO_OPTIONS

const opcionesPromo = [
  { label: 'En promoción', value: 'si' },
  { label: 'Sin promoción', value: 'no' }
]

const filtros = reactive({
  fecha: null,
  fechaDesde: null,
  fechaHasta: null,
  metodoPago: null,
  busqueda: '',
  esPromocion: null
})

const hayFiltrosActivos = computed(() =>
  filtros.fecha || filtros.fechaDesde || filtros.fechaHasta ||
  filtros.metodoPago || filtros.busqueda || filtros.esPromocion
)

function limpiarFiltros() {
  Object.assign(filtros, { fecha: null, fechaDesde: null, fechaHasta: null, metodoPago: null, busqueda: '', esPromocion: null })
}

/* ─── Columnas ─── */
const columnasVentas = [
  { name: 'fecha',        label: 'Fecha',     field: 'fecha',        align: 'left',   sortable: true },
  { name: 'hora',         label: 'Hora',      field: 'hora',         align: 'left' },
  { name: 'productos',    label: 'Productos', field: 'items',        align: 'left' },
  { name: 'cantidadTotal', label: 'Arts.',   field: 'cantidadTotal', align: 'center' },
  { name: 'total',        label: 'Total',     field: 'total',        align: 'right',  sortable: true },
  { name: 'metodoPago',   label: 'Método',    field: 'metodoPago',   align: 'center' }
]

const columnasMovimientos = [
  { name: 'fecha',       label: 'Fecha',       field: 'fecha',       align: 'left',   sortable: true },
  { name: 'tipo',        label: 'Tipo',         field: 'tipo',        align: 'center' },
  { name: 'valor',       label: 'Valor',        field: 'valor',       align: 'right',  sortable: true },
  { name: 'motivo',      label: 'Motivo',       field: 'motivo',      align: 'left' },
  { name: 'observacion', label: 'Observación',  field: 'observacion', align: 'left' }
]

/* ─── Datos filtrados ─── */
const ventasFiltradas = computed(() => {
  let data = [...(ventasStore.ventas || [])]
  const f = filtros
  if (f.busqueda) {
    const q = f.busqueda.toLowerCase()
    data = data.filter(v =>
      (v.items || []).some(i =>
        i.categoria.toLowerCase().includes(q) ||
        (i.referencia || '').toLowerCase().includes(q)
      ) ||
      (v.observacion || '').toLowerCase().includes(q)
    )
  }
  if (f.fecha) {
    data = data.filter(v => v.fecha?.startsWith(f.fecha))
  } else {
    if (f.fechaDesde) data = data.filter(v => v.fecha >= f.fechaDesde)
    if (f.fechaHasta) data = data.filter(v => v.fecha <= f.fechaHasta + 'T23:59:59')
  }
  if (f.metodoPago)        data = data.filter(v => v.metodoPago === f.metodoPago)
  if (f.esPromocion === 'si') data = data.filter(v => v.esPromocion)
  if (f.esPromocion === 'no') data = data.filter(v => !v.esPromocion)
  return data
})

const movimientosFiltrados = computed(() => {
  let data = [...(movimientosHistorial.value || [])]
  const f = filtros
  if (f.fecha) data = data.filter(m => m.fecha?.startsWith(f.fecha))
  else {
    if (f.fechaDesde) data = data.filter(m => m.fecha >= f.fechaDesde)
    if (f.fechaHasta) data = data.filter(m => m.fecha <= f.fechaHasta + 'T23:59:59')
  }
  return data
})

const diasResumen = computed(() => {
  const map = {}
  ventasFiltradas.value.forEach(v => {
    const key = v.fecha?.substring(0, 10)
    if (!key) return
    if (!map[key]) map[key] = mkDia(key)
    map[key].totalVentas++
    map[key].totalMonto     += v.total || 0
    map[key].efectivo       += v.metodoPago === 'efectivo'      ? (v.total || 0) : 0
    map[key].transferencia  += v.metodoPago === 'transferencia' ? (v.total || 0) : 0
    map[key].tarjeta        += v.metodoPago === 'tarjeta'       ? (v.total || 0) : 0
    map[key].ventas.push(v)
  })
  return Object.values(map).sort((a, b) => b.fecha.localeCompare(a.fecha))
})

function mkDia(fecha) {
  return reactive({ fecha, totalVentas: 0, totalMonto: 0, efectivo: 0, transferencia: 0, tarjeta: 0, ventas: [], expanded: false })
}

/* ─── Tabs config ─── */
const tabs = [
  { value: 'ventas',      label: 'Ventas',            icon: 'point_of_sale',  count: computed(() => ventasFiltradas.value.length) },
  { value: 'movimientos', label: 'Movimientos Caja',  icon: 'account_balance', count: computed(() => movimientosFiltrados.value.length) },
  { value: 'resumen',     label: 'Resumen Diario',    icon: 'calendar_month', count: computed(() => diasResumen.value.length) }
]

function chipColor(m) { return METODOS_PAGO_CHIPS[m] || 'grey' }
function metodoLabel(m) { return METODOS_PAGO_LABELS[m] || m }

onMounted(async () => {
  ventasStore.cargarVentas()
  cajaStore.cargarEstadoCaja()
  try {
    const res = await obtenerHistorialCompleto()
    movimientosHistorial.value = res?.data?.movimientos || []
  } catch {
    movimientosHistorial.value = []
  }
})
</script>

<style scoped>
/* ─── Header pills ─── */
.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-semi);
}
.stat-pill--blue { background: rgba(79,70,229,0.1); color: var(--q-primary); }
.stat-pill--teal { background: rgba(13,148,136,0.1); color: var(--q-secondary); }

/* ─── Filter panel ─── */
.filter-panel {}

.filter-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--pc-border);
}

/* ── Título del header (16px / 700 body) ── */
.filter-panel-title {
  font-size: var(--pc-text-base);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-body);
}

.filter-panel-body {
  display: flex;
  gap: 0;
  padding: 16px 20px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 280px;
}

/* ── Label del filtro (13px / 700 uppercase hint) ── */
.filter-group-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--pc-text-xs);
  font-weight: var(--pc-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--pc-tracking-wide);
  color: var(--pc-text-hint);
  margin-bottom: 10px;
}

.filter-group-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-input { min-width: 140px; flex: 1; }
.filter-input--wide { min-width: 200px; flex: 2; }

.filter-divider {
  width: 1px;
  background: var(--pc-border);
  margin: 0 20px;
  align-self: stretch;
}

/* ── Barra de resultado del filtro (15px / muted) ── */
.filter-result-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(79,70,229,0.04);
  border-top: 1px solid var(--pc-border);
  font-size: var(--pc-text-md);
  color: var(--pc-text-muted);
}

/* ─── Big tabs ─── */
.big-tabs {
  display: flex;
  gap: 0;
  padding: 16px 20px 0;
  border-bottom: none;
}

/* ── Tab individual (16px / 700 label) ── */
.big-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border: 2px solid var(--pc-border);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  background: var(--pc-surface-variant);
  cursor: pointer;
  transition: all 0.15s;
  margin-right: 6px;
  color: var(--pc-text-muted);
  min-width: 160px;
  justify-content: center;
}

.big-tab:hover {
  background: rgba(79,70,229,0.05);
  color: var(--q-primary);
}

.big-tab--active {
  background: var(--pc-surface) !important;
  border-color: var(--pc-border) !important;
  border-bottom-color: var(--pc-surface) !important;
  color: var(--q-primary) !important;
  box-shadow: 0 -2px 8px rgba(79,70,229,0.08);
  position: relative;
  z-index: 1;
}

.big-tab-icon { line-height: var(--pc-lh-none); }

/* ── Label del tab (16px / 700 / lh-none) ── */
.big-tab-label {
  font-size: var(--pc-text-base);
  font-weight: var(--pc-weight-bold);
  line-height: var(--pc-lh-none);
}

/* ── Contador del tab (13px / 600 / lh-none) ── */
.big-tab-count {
  font-size: var(--pc-text-xs);
  font-weight: var(--pc-weight-semi);
  color: inherit;
  opacity: 0.65;
  line-height: var(--pc-lh-none);
  margin-top: 2px;
}

.tab-divider {
  height: 1px;
  background: var(--pc-border);
  margin: 0;
}

/* ─── Tab panel ─── */
.tab-panel {}

/* ── Historial table accent ── */
.hist-table :deep(.q-table thead th) {
  background: #FAFAFF !important;
  border-bottom: 2px solid var(--pc-border) !important;
}

.hist-table :deep(.q-table tbody td) {
  vertical-align: middle !important;
}

/* ─── Items tags en tabla historial ─── */
.items-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

/* ── Tag de item (14px / 600 / body) ── */
.item-tag-sm {
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-semi);
  color: var(--pc-text-body);
  background: var(--pc-surface-variant);
  border: 1px solid var(--pc-border);
  border-radius: 5px;
  padding: 2px 8px;
}

/* ── Referencia de item (400 / hint) ── */
.item-ref-sm { font-weight: var(--pc-weight-regular); color: var(--pc-text-hint); }

/* ── "+N más" tag (13px / 700) ── */
.item-more-sm {
  font-size: var(--pc-text-xs);
  font-weight: var(--pc-weight-bold);
  color: var(--q-primary);
  background: rgba(79,70,229,0.08);
  border-radius: 5px;
  padding: 2px 8px;
}

/* ─── Cell styles ─── */
.date-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Día numérico en fecha (17px / 800) ── */
.date-day {
  width: 40px; height: 40px;
  background: rgba(79,70,229,0.1);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: var(--pc-weight-extra);
  color: var(--q-primary);
  flex-shrink: 0;
}

.date-info {}
/* ── Fecha principal (15px / 600 / body) ── */
.date-main { font-size: var(--pc-text-md); font-weight: var(--pc-weight-semi); color: var(--pc-text-body); }
/* ── Fecha amigable (13px / hint) ── */
.date-friendly { font-size: var(--pc-text-xs); color: var(--pc-text-hint); margin-top: 1px; }

/* ── Chip de hora (14px / 700) ── */
.time-chip {
  display: inline-block;
  background: rgba(79,70,229,0.07);
  color: var(--q-primary);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
  font-variant-numeric: tabular-nums;
}

.cat-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-icon-mini {
  width: 28px; height: 28px;
  background: rgba(79,70,229,0.08);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ── Nombre de categoría (15px / 600 / primary) ── */
.cat-name { font-size: var(--pc-text-md); font-weight: var(--pc-weight-semi); color: var(--pc-text-primary); }
/* ── Referencia de categoría (13px / hint) ── */
.cat-ref  { font-size: var(--pc-text-xs); color: var(--pc-text-hint); margin-top: 1px; }

/* ── Badge de cantidad (14px / 700) ── */
.qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  background: rgba(79,70,229,0.08);
  border-radius: 50%;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
  color: var(--q-primary);
}

/* ── Celda de total (17px / 800 / primary) ── */
.total-cell {
  font-size: 17px;
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
  font-variant-numeric: tabular-nums;
}

/* ── Badge de método (13px) ── */
.metodo-badge {
  font-size: var(--pc-text-xs) !important;
  padding: 5px 13px !important;
}

/* ── Celda de tipo (14px / 700) ── */
.tipo-cell {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 13px;
  border-radius: 20px;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
}
.tipo-cell--ingreso { background: rgba(5,150,105,0.1); color: var(--q-positive); }
.tipo-cell--retiro  { background: rgba(220,38,38,0.1);  color: var(--q-negative); }

/* ── Celda de valor (17px / 800 / lh-tight) ── */
.valor-cell {
  font-size: 17px;
  font-weight: var(--pc-weight-extra);
  font-variant-numeric: tabular-nums;
}
.valor-pos { color: var(--q-positive); }
.valor-neg { color: var(--q-negative); }

/* ── Celda de motivo (15px / 500 / body) ── */
.motivo-cell  { font-size: var(--pc-text-md); font-weight: var(--pc-weight-medium); color: var(--pc-text-body); }
/* ── Celda de observación (14px / hint) ── */
.obs-cell     { font-size: var(--pc-text-sm); color: var(--pc-text-hint); }

/* ─── Resumen diario ─── */
.resumen-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dia-card {
  background: var(--pc-surface);
  border: 1px solid var(--pc-border);
  border-radius: var(--pc-radius-md);
  overflow: hidden;
  transition: box-shadow 0.18s;
}

.dia-card:hover { box-shadow: var(--pc-shadow-md); }

.dia-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  cursor: pointer;
  transition: background 0.15s;
}

.dia-header:hover { background: rgba(79,70,229,0.02); }

.dia-fecha-badge {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.12));
  border: 1.5px solid rgba(79,70,229,0.2);
  border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ── Número del día (22px / 900 / lh-none) ── */
.dia-num { font-size: var(--pc-text-xl); font-weight: var(--pc-weight-black); color: var(--q-primary); line-height: var(--pc-lh-none); }
/* ── Mes del día (12px / 700 / uppercase / hint) ── */
.dia-mes { font-size: var(--pc-text-2xs); font-weight: var(--pc-weight-bold); color: var(--pc-text-hint); text-transform: uppercase; }

.dia-info { min-width: 140px; }
/* ── Título del día (18px / 700 / primary) ── */
.dia-title { font-size: var(--pc-text-lg); font-weight: var(--pc-weight-bold); color: var(--pc-text-primary); }
/* ── Subtítulo del día (14px / hint) ── */
.dia-sub   { font-size: var(--pc-text-sm); color: var(--pc-text-hint); margin-top: 2px; }

.dia-metrics {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.dia-metric {
  padding: 4px 20px;
  text-align: center;
}

/* ── Valor de métrica (17px / 800 / lh-tight) ── */
.dia-metric-val {
  font-size: 17px;
  font-weight: var(--pc-weight-extra);
  font-variant-numeric: tabular-nums;
  line-height: var(--pc-lh-tight);
}

/* ── Label de métrica (12px / 600 / uppercase / wide / hint) ── */
.dia-metric-lab {
  font-size: var(--pc-text-2xs);
  font-weight: var(--pc-weight-semi);
  text-transform: uppercase;
  letter-spacing: var(--pc-tracking-wide);
  color: var(--pc-text-hint);
  margin-top: 2px;
}

.dia-metric-sep {
  width: 1px;
  height: 32px;
  background: var(--pc-border);
  flex-shrink: 0;
}

.dia-toggle {
  flex-shrink: 0;
  margin-left: 8px;
}

/* Barra de métodos */
.dia-bar {
  display: flex;
  height: 4px;
  overflow: hidden;
}

.dia-bar-segment { transition: width 0.3s ease; }
.dia-bar--efectivo      { background: var(--q-positive); }
.dia-bar--transferencia { background: var(--q-info); }
.dia-bar--tarjeta       { background: var(--q-accent); }

/* Expandible */
.dia-body {
  padding: 20px 24px;
  border-top: 1px solid var(--pc-border);
  background: var(--pc-surface-variant);
}

/* Mini tabla de ventas en día */
.venta-tabla {
  border: 1px solid var(--pc-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--pc-surface);
}

/* ── Header mini tabla (13px / 800 / uppercase / wide / hint) ── */
.venta-tabla-header {
  display: grid;
  grid-template-columns: 80px 1fr 70px 130px 120px;
  padding: 12px 16px;
  background: #FAFAFF;
  border-bottom: 1px solid var(--pc-border);
  font-size: var(--pc-text-xs);
  font-weight: var(--pc-weight-extra);
  text-transform: uppercase;
  letter-spacing: var(--pc-tracking-wide);
  color: var(--pc-text-hint);
  gap: 12px;
}

.venta-tabla-row {
  display: grid;
  grid-template-columns: 80px 1fr 70px 130px 120px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(79,70,229,0.04);
  align-items: center;
  gap: 12px;
  transition: background 0.1s;
}

.venta-tabla-row:last-child { border-bottom: none; }
.venta-tabla-row:hover { background: rgba(79,70,229,0.03); }

.cat-cell-sm {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* Transición expand */
.expand-enter-active, .expand-leave-active {
  transition: all 0.22s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 800px;
}

/* Responsive */
@media (max-width: 768px) {
  .dia-metrics { display: none; }
  .filter-divider { display: none; }
  .filter-group { min-width: 100%; }
  .venta-tabla-header,
  .venta-tabla-row { grid-template-columns: 60px 1fr 90px 90px; }
  .venta-tabla-header > :nth-child(3),
  .venta-tabla-row   > :nth-child(3) { display: none; }
  .big-tab { min-width: auto; flex: 1; }
}
</style>
