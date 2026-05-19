<template>
  <div class="pc-card">

    <!-- Header -->
    <div class="pc-card-header">
      <div class="pc-icon-box" style="background:linear-gradient(135deg,#4F46E5,#7C3AED)">
        <q-icon name="swap_horiz" size="16px" color="white" />
      </div>
      <span class="pc-card-title">Movimientos de Caja</span>
      <q-space />
      <q-badge
        v-if="movimientosOrdenados.length > 0"
        color="primary"
        :label="`${movimientosOrdenados.length} movimiento${movimientosOrdenados.length > 1 ? 's' : ''}`"
        outline
      />
    </div>

    <q-table
      :rows="movimientosOrdenados"
      :columns="columns"
      row-key="id"
      flat
      :pagination="pagination"
      :rows-per-page-options="[5, 10, 15, 20]"
      class="cash-table"
    >
      <!-- Fecha -->
      <template v-slot:body-cell-fecha="props">
        <q-td :props="props">
          <div class="pc-date-cell">
            <div class="pc-date-day">{{ new Date(props.value).getDate() }}</div>
            <div>
              <div class="pc-date-main">{{ formatDateShort(props.value) }}</div>
              <div class="pc-date-sub">{{ formatTime(props.value) }}</div>
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
              size="15px"
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
          <span class="motivo-cell">{{ props.value || '—' }}</span>
        </q-td>
      </template>

      <!-- Observación -->
      <template v-slot:body-cell-observacion="props">
        <q-td :props="props">
          <span class="obs-cell">{{ props.value || '—' }}</span>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width q-pa-xl">
          <EmptyState
            icon="swap_horiz"
            title="Sin movimientos"
            message="No hay movimientos de caja en esta sesión"
          />
        </div>
      </template>
    </q-table>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCajaStore } from '@/store/cajaStore'
import { formatCurrency, formatTime } from '@/common/format'
import EmptyState from '@/components/Shared/EmptyState.vue'

const cajaStore = useCajaStore()

const pagination = ref({ rowsPerPage: 10, sortBy: 'fecha', descending: true })

const columns = [
  { name: 'fecha',       label: 'Fecha',       field: 'fecha',       align: 'left',   sortable: true },
  { name: 'tipo',        label: 'Tipo',         field: 'tipo',        align: 'center' },
  { name: 'valor',       label: 'Valor',        field: 'valor',       align: 'right',  sortable: true },
  { name: 'motivo',      label: 'Motivo',       field: 'motivo',      align: 'left' },
  { name: 'observacion', label: 'Observación',  field: 'observacion', align: 'left' }
]

const movimientosOrdenados = computed(() => {
  return [...(cajaStore.movimientos || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

function formatDateShort(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
/* Tabla accent */
.cash-table :deep(.q-table thead th) {
  background: #FAFAFF !important;
  border-bottom: 2px solid var(--pc-border) !important;
}

.cash-table :deep(.q-table tbody td) {
  vertical-align: middle !important;
}



/* Celda tipo */
.tipo-cell {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
}

.tipo-cell--ingreso {
  background: rgba(5,150,105,0.1);
  color: var(--q-positive);
}
.tipo-cell--retiro {
  background: rgba(220,38,38,0.1);
  color: var(--q-negative);
}

/* Celda valor */
.valor-cell {
  font-size: 17px;
  font-weight: var(--pc-weight-extra);
  font-variant-numeric: tabular-nums;
}
.valor-pos { color: var(--q-positive); }
.valor-neg { color: var(--q-negative); }

/* Celdas texto */
.motivo-cell { font-size: var(--pc-text-md); font-weight: var(--pc-weight-medium); color: var(--pc-text-body); }
.obs-cell    { font-size: var(--pc-text-sm); color: var(--pc-text-hint); }
</style>
