<template>
  <div class="pc-card">

    <!-- Header -->
    <div class="card-header row items-center justify-between">
      <div class="row items-center q-gutter-x-sm">
        <q-icon name="receipt_long" size="18px" color="primary" />
        <span class="pc-card-title">Ventas Registradas</span>
      </div>
      <div class="row q-gutter-x-xs">
        <q-btn flat color="accent" icon="picture_as_pdf" label="PDF" @click="exportarPDF" size="sm" no-caps>
          <q-tooltip>Exportar PDF</q-tooltip>
        </q-btn>
        <q-btn flat color="positive" icon="code" label="JSON" @click="exportarJSON" size="sm" no-caps>
          <q-tooltip>Exportar JSON</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Filtros -->
    <div class="q-px-md q-pt-md q-pb-sm">
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-4">
          <q-input
            v-model="busqueda"
            dense outlined
            placeholder="Buscar producto, referencia..."
            :debounce="300"
            clearable
          >
            <template v-slot:prepend><q-icon name="search" color="grey-5" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-3">
          <q-select
            v-model="filtroMetodo"
            dense outlined
            :options="METODOS_PAGO_OPTIONS"
            label="Método de pago"
            clearable emit-value map-options
          />
        </div>
        <div class="col-6 col-sm-2">
          <q-input v-model="fechaDesde" dense outlined type="date" label="Desde" />
        </div>
        <div class="col-6 col-sm-3">
          <q-input v-model="fechaHasta" dense outlined type="date" label="Hasta" />
        </div>
      </div>
    </div>

    <q-table
      :rows="filasFiltradas"
      :columns="columns"
      row-key="id"
      flat
      :pagination="pagination"
      :rows-per-page-options="[5, 10, 15, 20, 50]"
      class="sales-table"
    >
      <!-- Fecha -->
      <template v-slot:body-cell-fecha="props">
        <q-td :props="props">
          <div class="date-cell">
            <div class="date-day">{{ props.value?.substring(8, 10) || '?' }}</div>
            <div class="date-info">
              <div class="date-main">{{ formatDate(props.value) }}</div>
              <div class="date-hora">{{ props.row.hora }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Productos -->
      <template v-slot:body-cell-productos="props">
        <q-td :props="props">
          <div class="productos-cell">
            <!-- Muestra hasta 2 categorías y "+N más" -->
            <div class="prod-tags">
              <span
                v-for="(item, i) in props.row.items?.slice(0, 2)"
                :key="i"
                class="prod-tag"
              >
                {{ item.categoria }}
                <span v-if="item.referencia" class="prod-ref"> · {{ item.referencia }}</span>
              </span>
              <span v-if="(props.row.items?.length || 0) > 2" class="prod-more">
                +{{ props.row.items.length - 2 }} más
              </span>
            </div>
            <q-badge v-if="props.row.esPromocion" color="warning" label="PROMO" dense class="q-mt-xs" />
          </div>
        </q-td>
      </template>

      <!-- Artículos -->
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

      <!-- Método de pago -->
      <template v-slot:body-cell-metodoPago="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="METODOS_PAGO_CHIPS[props.value] || 'grey'"
            text-color="white"
            :label="METODOS_PAGO_LABELS[props.value] || props.value"
            class="metodo-badge"
          />
        </q-td>
      </template>

      <!-- Acción: ver detalle -->
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat round dense
            icon="visibility"
            color="primary"
            size="sm"
            @click="verDetalle(props.row)"
          >
            <q-tooltip>Ver detalle</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width q-pa-lg">
          <EmptyState
            icon="receipt_long"
            title="Sin ventas"
            message="No se encontraron ventas con los filtros aplicados"
          />
        </div>
      </template>
    </q-table>

    <!-- Modal de detalle -->
    <SaleDetailModal ref="detalleRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVentasStore } from '@/store/ventasStore'
import { formatCurrency, formatDate } from '@/common/format'
import { METODOS_PAGO_LABELS, METODOS_PAGO_CHIPS, METODOS_PAGO_OPTIONS } from '@/constants'
import EmptyState from '@/components/Shared/EmptyState.vue'
import SaleDetailModal from '@/components/Ventas/SaleDetailModal.vue'

const ventasStore = useVentasStore()
const detalleRef  = ref(null)

const busqueda    = ref('')
const filtroMetodo = ref(null)
const fechaDesde  = ref(new Date().toISOString().split('T')[0])
const fechaHasta  = ref(null)
const pagination  = ref({ rowsPerPage: 10, sortBy: 'fecha', descending: true })

const columns = [
  { name: 'fecha',        label: 'Fecha',      field: 'fecha',        align: 'left',   sortable: true },
  { name: 'productos',    label: 'Productos',   field: 'items',        align: 'left' },
  { name: 'cantidadTotal', label: 'Arts.',      field: 'cantidadTotal', align: 'center', sortable: true },
  { name: 'total',        label: 'Total',      field: 'total',        align: 'right',  sortable: true },
  { name: 'metodoPago',   label: 'Método',     field: 'metodoPago',   align: 'center' },
  { name: 'acciones',     label: '',           field: 'id',           align: 'center' }
]

const filasFiltradas = computed(() => {
  let data = ventasStore.ventas || []

  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    data = data.filter(v =>
      v.items?.some(i =>
        i.categoria.toLowerCase().includes(q) ||
        (i.referencia && i.referencia.toLowerCase().includes(q))
      ) ||
      (v.observacion && v.observacion.toLowerCase().includes(q))
    )
  }

  if (filtroMetodo.value) {
    data = data.filter(v => v.metodoPago === filtroMetodo.value)
  }

  if (fechaDesde.value) {
    data = data.filter(v => v.fecha >= fechaDesde.value)
  }

  if (fechaHasta.value) {
    data = data.filter(v => v.fecha <= fechaHasta.value)
  }

  return data
})

function verDetalle(venta) {
  detalleRef.value?.abrir(venta)
}

function exportarJSON() {
  const data = JSON.stringify(filasFiltradas.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ventas_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportarPDF() {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Reporte de Ventas - ProCuentas', 14, 20)
  doc.setFontSize(10)
  doc.text(`Fecha: ${formatDate(new Date())}`, 14, 28)

  const headers = [['#', 'Fecha', 'Productos', 'Arts.', 'Total', 'Método']]
  const rows = filasFiltradas.value.map((v, i) => [
    i + 1,
    v.fecha || '',
    v.items?.map(it => it.categoria).join(', ') || '',
    v.cantidadTotal || 0,
    formatCurrency(v.total || 0),
    METODOS_PAGO_LABELS[v.metodoPago] || v.metodoPago
  ])

  autoTable(doc, { head: headers, body: rows, startY: 32 })
  doc.save(`ventas_${new Date().toISOString().split('T')[0]}.pdf`)
}
</script>

<style scoped>
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--pc-border);
}

/* Tabla */
.sales-table :deep(.q-table thead th) {
  font-size: var(--pc-text-xs) !important;
  font-weight: var(--pc-weight-extra) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  color: var(--pc-text-muted) !important;
  padding: 15px 20px !important;
  background: #FAFAFF !important;
  border-bottom: 2px solid var(--pc-border) !important;
  white-space: nowrap;
}

.sales-table :deep(.q-table tbody td) {
  padding: 15px 20px !important;
  font-size: var(--pc-text-md) !important;
  border-bottom: 1px solid rgba(79,70,229,0.05) !important;
  vertical-align: middle !important;
}

.sales-table :deep(.q-table tbody tr:hover td) {
  background: rgba(79,70,229,0.03) !important;
}

/* Celda fecha */
.date-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-day {
  width: 40px; height: 40px;
  background: rgba(79,70,229,0.1);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: var(--pc-weight-extra);
  color: var(--q-primary);
  flex-shrink: 0;
}

.date-main { font-size: var(--pc-text-md); font-weight: var(--pc-weight-semi); color: var(--pc-text-body); }
.date-hora { font-size: var(--pc-text-xs); color: var(--pc-text-hint); margin-top: 1px; }

/* Celda productos */
.productos-cell { display: flex; flex-direction: column; gap: 4px; }

.prod-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.prod-tag {
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-semi);
  color: var(--pc-text-primary);
  background: var(--pc-surface-variant);
  border: 1px solid var(--pc-border);
  border-radius: 6px;
  padding: 3px 10px;
  white-space: nowrap;
}

.prod-ref { font-weight: var(--pc-weight-regular); color: var(--pc-text-hint); font-size: var(--pc-text-xs); }

.prod-more {
  font-size: var(--pc-text-xs);
  font-weight: var(--pc-weight-bold);
  color: var(--q-primary);
  background: rgba(79,70,229,0.08);
  border-radius: 6px;
  padding: 3px 10px;
}

/* Artículos */
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

/* Total */
.total-cell {
  font-size: 17px;
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
  font-variant-numeric: tabular-nums;
}

/* Método */
.metodo-badge {
  font-size: var(--pc-text-xs) !important;
  padding: 5px 13px !important;
}
</style>
