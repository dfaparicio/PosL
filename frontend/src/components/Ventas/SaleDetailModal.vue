<template>
  <q-dialog v-model="model" :maximized="$q.screen.lt.sm">
    <q-card class="pc-modal" style="max-width: 600px">

      <!-- Header -->
      <div class="pc-modal-header">
        <div class="pc-modal-header-icon" style="background: linear-gradient(135deg, #4F46E5, #7C3AED)">
          <q-icon name="receipt_long" size="20px" color="white" />
        </div>
        <div class="q-ml-sm">
          <div class="pc-modal-title">Detalle de Venta</div>
          <div class="pc-modal-sub">{{ venta?.fecha }} · {{ venta?.hora }}</div>
        </div>
        <q-space />
        <q-btn flat icon="close" color="grey-5" v-close-popup round dense />
      </div>

      <template v-if="venta">
        <!-- Meta de la venta -->
        <div class="detail-meta">
          <div class="meta-chip">
            <q-icon :name="pagoIcon" size="14px" />
            {{ METODOS_PAGO_LABELS[venta.metodoPago] || venta.metodoPago }}
          </div>
          <div v-if="venta.esPromocion" class="meta-chip meta-promo">
            <q-icon name="local_offer" size="14px" />
            Incluye promociones
          </div>
          <div class="meta-chip meta-items">
            <q-icon name="inventory_2" size="14px" />
            {{ venta.cantidadTotal }} artículo{{ venta.cantidadTotal > 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Tabla de ítems -->
        <div class="detail-items">
          <div class="items-header">
            <span class="th-cat">Producto</span>
            <span class="th-precio">Precio</span>
            <span class="th-qty">Cant.</span>
            <span class="th-desc">Desc.</span>
            <span class="th-sub">Subtotal</span>
          </div>

          <div v-for="(item, i) in venta.items" :key="i" class="items-row">
            <div class="td-cat">
              <div class="item-cat-name">{{ item.categoria }}</div>
              <div v-if="item.referencia" class="item-ref">{{ item.referencia }}</div>
              <q-badge v-if="item.esPromocion" color="warning" label="PROMO" dense />
            </div>
            <span class="td-precio">{{ formatCurrency(item.precio) }}</span>
            <span class="td-qty">
              <div class="qty-pill">×{{ item.cantidad }}</div>
            </span>
            <span class="td-desc">
              <span v-if="item.descuento > 0" class="text-negative" style="font-size:var(--pc-text-2xs);font-weight:var(--pc-weight-bold)">
                −{{ formatCurrency(item.descuento) }}
              </span>
              <span v-else class="text-grey-4">—</span>
            </span>
            <span class="td-sub">{{ formatCurrency(item.subtotal) }}</span>
          </div>
        </div>

        <!-- Totales -->
        <div class="detail-totals">
          <div class="total-row total-final">
            <span>Total</span>
            <span class="total-val">{{ formatCurrency(venta.total) }}</span>
          </div>
        </div>

        <!-- Observación -->
        <div v-if="venta.observacion && venta.observacion !== 'N/A'" class="detail-obs">
          <q-icon name="comment" size="14px" color="grey-5" />
          <span>{{ venta.observacion }}</span>
        </div>
      </template>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { formatCurrency } from '@/common/format'
import { METODOS_PAGO_LABELS } from '@/constants'

const $q = useQuasar()

const model = ref(false)
const venta = ref(null)

const pagoIcon = computed(() => {
  const map = { efectivo: 'payments', transferencia: 'swap_horiz', tarjeta: 'credit_card' }
  return map[venta.value?.metodoPago] || 'payment'
})

function abrir(v) {
  venta.value = v
  model.value = true
}

defineExpose({ abrir })
</script>

<style scoped>

/* Meta chips */
.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--pc-surface-variant);
  border-bottom: 1px solid var(--pc-border);
  flex-wrap: wrap;
}

.meta-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--pc-text-2xs);
  font-weight: var(--pc-weight-bold);
  background: rgba(79,70,229,0.08);
  color: var(--q-primary);
  border: 1px solid rgba(79,70,229,0.15);
}

.meta-promo { background: rgba(217,119,6,0.08); color: var(--q-warning); border-color: rgba(217,119,6,0.2); }
.meta-items { background: rgba(5,150,105,0.08); color: var(--q-positive); border-color: rgba(5,150,105,0.2); }

/* Tabla de ítems */
.detail-items { padding: 0 20px; }

.items-header {
  display: grid;
  grid-template-columns: 1fr 90px 56px 80px 90px;
  padding: 10px 0 8px;
  font-size: var(--pc-text-4xs);
  font-weight: var(--pc-weight-extra);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--pc-text-hint);
  border-bottom: 2px solid var(--pc-border);
  gap: 8px;
}

.items-row {
  display: grid;
  grid-template-columns: 1fr 90px 56px 80px 90px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(79,70,229,0.05);
  align-items: center;
  gap: 8px;
}

.items-row:last-child { border-bottom: none; }

.th-cat, .td-cat { }
.th-precio, .td-precio { text-align: right; font-size: var(--pc-text-xs); color: var(--pc-text-muted); font-variant-numeric: tabular-nums; }
.th-qty,    .td-qty    { text-align: center; }
.th-desc,   .td-desc   { text-align: right; }
.th-sub,    .td-sub    { text-align: right; font-size: var(--pc-text-sm); font-weight: var(--pc-weight-extra); color: var(--pc-text-primary); font-variant-numeric: tabular-nums; }

.item-cat-name { font-size: var(--pc-text-sm); font-weight: var(--pc-weight-bold); color: var(--pc-text-primary); }
.item-ref      { font-size: var(--pc-text-3xs); color: var(--pc-text-hint); margin-top: 1px; }

.qty-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  background: rgba(79,70,229,0.08);
  border-radius: 12px;
  font-size: var(--pc-text-2xs);
  font-weight: var(--pc-weight-extra);
  color: var(--q-primary);
  padding: 0 6px;
}

/* Totales */
.detail-totals {
  padding: 12px 20px;
  border-top: 2px solid var(--pc-border);
  background: var(--pc-surface-variant);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: var(--pc-text-xs);
  color: var(--pc-text-muted);
}

.total-final {
  font-size: var(--pc-text-base);
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
  background: rgba(79,70,229,0.06);
  border-radius: 10px;
  border: 1.5px solid rgba(79,70,229,0.15);
  padding: 10px 16px;
}

.total-val {
  font-size: var(--pc-text-xl);
  font-weight: var(--pc-weight-black);
  color: var(--q-primary);
  font-variant-numeric: tabular-nums;
}

/* Observación */
.detail-obs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px 14px;
  font-size: var(--pc-text-xs);
  color: var(--pc-text-muted);
}
</style>
