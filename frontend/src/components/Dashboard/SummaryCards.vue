<template>
  <div class="row equal-height q-col-gutter-lg">
    <div
      v-for="card in cards"
      :key="card.key"
      class="col-12 col-sm-6 col-lg-4"
    >
      <!-- Skeleton -->
      <div v-if="isLoading" class="pc-card pc-card--lift full-card summary-card">
        <div class="pc-card-body row items-center q-gutter-x-lg">
          <div class="skeleton-box" style="width:56px;height:56px;border-radius:14px;flex-shrink:0" />
          <div class="col">
            <div class="skeleton-box q-mb-sm" style="width:55%;height:13px" />
            <div class="skeleton-box" style="width:75%;height:28px" />
          </div>
        </div>
      </div>

      <!-- Card real -->
      <div v-else class="pc-card pc-card--lift full-card summary-card">
        <div class="pc-card-body row items-center q-gutter-x-lg">
          <div class="icon-box" :style="{ background: card.gradient }">
            <q-icon :name="card.icon" color="white" size="28px" />
          </div>
          <div class="col">
            <div class="pc-label q-mb-sm">{{ card.label }}</div>
            <div class="pc-stat-value-md text-dark">{{ card.value }}</div>
            <div v-if="card.badge" class="q-mt-sm">
              <q-chip
                :color="cajaAbierta ? 'positive' : 'negative'"
                text-color="white"
                :icon="cajaAbierta ? 'lock_open' : 'lock'"
                :label="cajaAbierta ? 'Abierta' : 'Cerrada'"
                dense
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCajaStore } from '@/store/cajaStore'
import { useVentasStore } from '@/store/ventasStore'
import { formatCurrency } from '@/common/format'

const cajaStore  = useCajaStore()
const ventasStore = useVentasStore()

const isLoading  = computed(() => cajaStore.loading || ventasStore.loading)
const cajaAbierta = computed(() => cajaStore.cajaAbierta)

const cards = computed(() => [
  {
    key: 'caja',
    label: 'Caja Actual',
    value: formatCurrency(cajaStore.cajaEsperada),
    icon: 'account_balance_wallet',
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
    badge: true
  },
  {
    key: 'ventas',
    label: 'Ventas Totales Hoy',
    value: formatCurrency(ventasStore.totalVentasDia),
    icon: 'trending_up',
    gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    badge: false
  },
  {
    key: 'efectivo',
    label: 'Efectivo Hoy',
    value: formatCurrency(ventasStore.ventasPorMetodoPagoHoy.efectivo),
    icon: 'payments',
    gradient: 'linear-gradient(135deg, #059669, #34D399)',
    badge: false
  },
  {
    key: 'transferencia',
    label: 'Transferencias Hoy',
    value: formatCurrency(ventasStore.ventasPorMetodoPagoHoy.transferencia),
    icon: 'swap_horiz',
    gradient: 'linear-gradient(135deg, #0284C7, #38BDF8)',
    badge: false
  },
  {
    key: 'tarjeta',
    label: 'Tarjeta Hoy',
    value: formatCurrency(ventasStore.ventasPorMetodoPagoHoy.tarjeta),
    icon: 'credit_card',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    badge: false
  },
  {
    key: 'articulos',
    label: 'Artículos Vendidos Hoy',
    value: ventasStore.productosVendidosHoy,
    icon: 'inventory_2',
    gradient: 'linear-gradient(135deg, #D97706, #FBBF24)',
    badge: false
  }
])
</script>

<style scoped>
.summary-card {
  min-height: 100px;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}
</style>
