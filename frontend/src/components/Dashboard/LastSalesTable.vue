<template>
  <div class="pc-card full-card">
    <div class="pc-card-header">
      <div class="pc-icon-box" style="background:linear-gradient(135deg,#4F46E5,#7C3AED)">
        <q-icon name="receipt_long" size="16px" color="white" />
      </div>
      <span class="pc-card-title">Últimas Ventas</span>
      <q-space />
      <q-btn
        flat color="primary" icon-right="arrow_forward"
        label="Ver historial" to="/historial"
        size="sm" no-caps dense
      />
    </div>

    <q-table
      v-if="ventasRecientes.length > 0"
      :rows="ventasRecientes"
      :columns="columns"
      row-key="id"
      flat
      hide-pagination
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-hora="props">
        <q-td :props="props">
          <span class="time-chip">{{ props.value }}</span>
        </q-td>
      </template>

      <!-- Resumen de ítems de la venta -->
      <template v-slot:body-cell-productos="props">
        <q-td :props="props">
          <div class="items-preview">
            <span
              v-for="(item, i) in (props.row.items || []).slice(0, 2)"
              :key="i"
              class="item-tag"
            >{{ item.categoria }}</span>
            <span v-if="(props.row.items?.length || 0) > 2" class="item-more">
              +{{ props.row.items.length - 2 }}
            </span>
            <q-badge v-if="props.row.esPromocion" color="warning" label="PROMO" dense />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-cantidadTotal="props">
        <q-td :props="props" class="text-center">
          <div class="qty-pill">{{ props.value }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-metodoPago="props">
        <q-td :props="props">
          <q-badge
            :color="METODOS_PAGO_CHIPS[props.value] || 'grey'"
            text-color="white"
            :label="METODOS_PAGO_LABELS[props.value] || props.value"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-total="props">
        <q-td :props="props" class="text-right">
          <span class="total-val">{{ formatCurrency(props.value) }}</span>
        </q-td>
      </template>
    </q-table>

    <div v-else class="pc-card-body">
      <EmptyState
        icon="receipt_long"
        title="Sin ventas aún"
        message="Las ventas registradas aparecerán aquí"
        action-label="Registrar Venta"
        action-to="/ventas"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useVentasStore } from '@/store/ventasStore'
import { formatCurrency } from '@/common/format'
import { METODOS_PAGO_LABELS, METODOS_PAGO_CHIPS } from '@/constants'
import EmptyState from '@/components/Shared/EmptyState.vue'

const ventasStore = useVentasStore()
const ventasRecientes = computed(() => ventasStore.ventasRecientes.slice(0, 12))

const columns = [
  { name: 'hora',          label: 'Hora',     field: 'hora',          align: 'left' },
  { name: 'productos',     label: 'Productos', field: 'items',         align: 'left' },
  { name: 'cantidadTotal', label: 'Arts.',    field: 'cantidadTotal', align: 'center' },
  { name: 'total',         label: 'Total',    field: 'total',         align: 'right', sortable: true },
  { name: 'metodoPago',    label: 'Método',   field: 'metodoPago',    align: 'center' }
]

onMounted(() => ventasStore.cargarVentasRecientes())
</script>

<style scoped>
/* ── Chip de hora ── */
.time-chip {
  background: rgba(79,70,229,0.07);
  color: var(--q-primary);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: var(--pc-text-2xs);
  font-weight: var(--pc-weight-bold);
  font-variant-numeric: tabular-nums;
}

.items-preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

/* ── Tag de item (12px / 600 body) ── */
.item-tag {
  font-size: var(--pc-text-2xs);
  font-weight: var(--pc-weight-semi);
  color: var(--pc-text-body);
  background: var(--pc-surface-variant);
  border: 1px solid var(--pc-border);
  border-radius: 5px;
  padding: 1px 7px;
}

/* ── "+N más" (11px / 700 primary) ── */
.item-more {
  font-size: var(--pc-text-3xs);
  font-weight: var(--pc-weight-bold);
  color: var(--q-primary);
  background: rgba(79,70,229,0.08);
  border-radius: 5px;
  padding: 1px 7px;
}

/* ── Pill de cantidad (12px / 700 primary) ── */
.qty-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  background: rgba(79,70,229,0.08);
  border-radius: 50%;
  font-size: var(--pc-text-2xs);
  font-weight: var(--pc-weight-bold);
  color: var(--q-primary);
  margin: 0 auto;
}

/* ── Valor total (14px / 800 primary-dark) ── */
.total-val {
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
  font-variant-numeric: tabular-nums;
}
</style>
