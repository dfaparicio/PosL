<template>
  <div class="pc-card full-card">
    <div class="pc-card-header">
      <div class="pc-icon-box" style="background:linear-gradient(135deg,#0284C7,#38BDF8)">
        <q-icon name="timeline" size="16px" color="white" />
      </div>
      <span class="pc-card-title">Movimientos del Día</span>
      <q-space />
      <q-badge v-if="items.length > 0" color="primary" :label="`${items.length}`" outline />
    </div>

    <div class="pc-card-body">
      <div v-if="items.length > 0" class="timeline-list">
        <div
          v-for="(item, i) in items"
          :key="i"
          class="timeline-item"
        >
          <!-- Línea y punto -->
          <div class="timeline-connector">
            <div class="timeline-dot" :class="`dot-${item.tipo}`">
              <q-icon :name="item.icono" size="14px" color="white" />
            </div>
            <div v-if="i < items.length - 1" class="timeline-line" />
          </div>

          <!-- Contenido -->
          <div class="timeline-content">
            <div class="row items-center justify-between q-mb-xs">
              <div class="row items-center q-gutter-x-sm">
                <span class="pc-body text-weight-semibold text-dark">{{ item.motivo || item.subtitulo }}</span>
                <q-badge
                  :color="item.tipo === 'ingreso' || item.tipo === 'venta' ? 'positive' : 'negative'"
                  text-color="white"
                  :label="item.subtitulo"
                  dense
                />
              </div>
              <span class="pc-body text-weight-bold" :class="item.tipo === 'retiro' ? 'text-negative' : 'text-positive'">
                {{ item.tipo === 'retiro' ? '−' : '+' }}{{ formatCurrency(item.valor) }}
              </span>
            </div>
            <div class="row items-center q-gutter-x-sm">
              <span class="pc-caption">{{ item.titulo }}</span>
              <span v-if="item.descripcion" class="pc-caption text-grey-4">· {{ item.descripcion }}</span>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        icon="timeline"
        title="Sin movimientos hoy"
        message="Los movimientos de caja y ventas en efectivo aparecerán aquí"
        action-label="Abrir Caja"
        action-to="/caja"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency, formatTime } from '@/common/format'
import { useCajaStore } from '@/store/cajaStore'
import { useVentasStore } from '@/store/ventasStore'
import EmptyState from '@/components/Shared/EmptyState.vue'

const cajaStore = useCajaStore()
const ventasStore = useVentasStore()

const items = computed(() => {
  const entradas = []

  ;(cajaStore.movimientos || []).forEach(m => {
    entradas.push({
      titulo: formatTime(m.fecha || m.createdAt),
      subtitulo: m.tipo === 'ingreso' ? 'Ingreso' : 'Retiro',
      icono: m.tipo === 'ingreso' ? 'add' : 'remove',
      tipo: m.tipo,
      motivo: m.motivo || 'Movimiento',
      descripcion: m.observacion || '',
      valor: m.valor || 0,
      fecha: m.fecha || m.createdAt
    })
  })

  ;(ventasStore.ventasHoy || []).forEach(v => {
    if (v.metodoPago !== 'efectivo') return
    entradas.push({
      titulo: formatTime(v.fecha),
      subtitulo: 'Venta efectivo',
      icono: 'point_of_sale',
      tipo: 'venta',
      motivo: v.categoria || v.producto || 'Venta',
      descripcion: v.referencia ? `Ref: ${v.referencia}` : '',
      valor: v.total || 0,
      fecha: v.fecha
    })
  })

  return entradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 20)
})
</script>

<style scoped>
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  min-height: 56px;
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
  padding-top: 2px;
}

.timeline-dot {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.dot-ingreso  { background: var(--q-positive); }
.dot-retiro   { background: var(--q-negative); }
.dot-venta    { background: var(--q-primary); }

.timeline-line {
  width: 2px;
  flex: 1;
  background: var(--pc-border);
  margin: 4px 0;
  min-height: 16px;
}

.timeline-content {
  flex: 1;
  padding: 4px 0 16px;
}
</style>
