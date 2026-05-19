<template>
  <MainLayout>
    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header row items-center justify-between">
        <div>
          <div class="page-title">Ventas</div>
          <div class="page-subtitle">{{ fechaHoy }}</div>
        </div>
        <div class="row items-center q-gutter-x-md">
          <q-chip
            :color="cajaStore.cajaAbierta ? 'positive' : 'negative'"
            text-color="white"
            :icon="cajaStore.cajaAbierta ? 'lock_open' : 'lock'"
            :label="cajaStore.cajaAbierta ? 'Caja abierta' : 'Caja cerrada'"
          />
        </div>
      </div>

      <!-- ─── BOTÓN NUEVA VENTA ─────────────────────────────── -->
      <div
        class="nueva-venta-hero q-mb-xl"
        :class="{ 'hero-locked': !cajaStore.cajaAbierta }"
        @click="abrirNuevaVenta"
      >
        <div class="hero-left">
          <div class="hero-icon-wrap">
            <q-icon
              :name="cajaStore.cajaAbierta ? 'point_of_sale' : 'lock'"
              size="48px"
              color="white"
            />
          </div>
          <div>
            <div class="hero-title">
              {{ cajaStore.cajaAbierta ? 'Nueva Venta' : 'Caja cerrada' }}
            </div>
            <div class="hero-sub">
              {{ cajaStore.cajaAbierta
                ? 'Toca aquí para registrar una venta rápidamente'
                : 'Abre la caja primero para registrar ventas' }}
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-btn">
            <q-icon :name="cajaStore.cajaAbierta ? 'add' : 'lock'" size="32px" color="white" />
          </div>
          <div v-if="cajaStore.cajaAbierta" class="hero-shortcut">tecla N</div>
          <q-btn
            v-else
            to="/caja"
            flat dense no-caps
            label="Ir a Caja"
            color="white"
            size="sm"
            @click.stop
            style="opacity:0.85"
          />
        </div>
        <!-- Efecto de brillo animado -->
        <div class="hero-shine" />
      </div>

      <!-- ─── Tabla de ventas ───────────────────────────────── -->
      <SalesTable />

      <!-- FAB mobile -->
      <q-page-sticky position="bottom-right" :offset="[20, 20]">
        <q-btn
          fab
          icon="add"
          color="primary"
          :disable="!cajaStore.cajaAbierta"
          @click="abrirNuevaVenta"
          style="box-shadow: 0 8px 24px rgba(79,70,229,0.4)"
        >
          <q-tooltip>{{ cajaStore.cajaAbierta ? 'Nueva Venta' : 'Caja cerrada' }}</q-tooltip>
        </q-btn>
      </q-page-sticky>

      <NewSaleModal ref="modalVentaRef" @saleCreated="onVentaCreada" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import SalesTable from '@/components/Ventas/SalesTable.vue'
import NewSaleModal from '@/components/Ventas/NewSaleModal.vue'
import { useVentasStore } from '@/store/ventasStore'
import { useCajaStore } from '@/store/cajaStore'
import { formatDateLong } from '@/common/format'

const ventasStore = useVentasStore()
const cajaStore   = useCajaStore()
const modalVentaRef = ref(null)

const fechaHoy = computed(() => formatDateLong(new Date()))

function abrirNuevaVenta() {
  if (!cajaStore.cajaAbierta) return
  modalVentaRef.value?.abrir()
}

function onVentaCreada() {
  ventasStore.cargarVentas()
  ventasStore.cargarVentasRecientes()
  cajaStore.cargarEstadoCaja()
}

// Atajo de teclado N
function onKeydown(e) {
  if ((e.key === 'n' || e.key === 'N') && cajaStore.cajaAbierta) {
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      abrirNuevaVenta()
    }
  }
}

onMounted(() => {
  ventasStore.cargarVentas()
  cajaStore.cargarEstadoCaja()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* ─── Hero botón de nueva venta ─── */
.nueva-venta-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #6D28D9 100%);
  border-radius: 18px;
  padding: 28px 32px;
  cursor: pointer;
  overflow: hidden;
  user-select: none;
  box-shadow: 0 8px 32px rgba(79, 70, 229, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.nueva-venta-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 40px rgba(79, 70, 229, 0.45);
}

.nueva-venta-hero:active {
  transform: translateY(0);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
}

/* Estado bloqueado cuando caja está cerrada */
.hero-locked {
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 60%, #374151 100%) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
  opacity: 0.85;
  cursor: not-allowed;
}

.hero-locked:hover {
  transform: none !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1;
}

.hero-icon-wrap {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
  border: 1.5px solid rgba(255,255,255,0.2);
}

/* ── Título hero (28px / 800) ── */
.hero-title {
  font-size: var(--pc-text-3xl);
  font-weight: var(--pc-weight-extra);
  color: white;
  line-height: var(--pc-lh-tight);
  letter-spacing: var(--pc-tracking-tighter);
}

/* ── Subtítulo hero (14px / 400 white 70%) ── */
.hero-sub {
  font-size: var(--pc-text-sm);
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 1;
}

.hero-btn {
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.3);
  transition: background 0.15s;
}

.nueva-venta-hero:hover .hero-btn {
  background: rgba(255,255,255,0.3);
}

/* ── Atajo de teclado (11px / 600 uppercase white 50%) ── */
.hero-shortcut {
  font-size: var(--pc-text-3xs);
  color: rgba(255,255,255,0.5);
  font-weight: var(--pc-weight-semi);
  text-transform: uppercase;
  letter-spacing: var(--pc-tracking-wider);
}

/* Efecto de brillo diagonal */
.hero-shine {
  position: absolute;
  top: -60%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

@media (max-width: 600px) {
  .nueva-venta-hero { padding: 20px; }
  .hero-title { font-size: var(--pc-text-xl); }
  .hero-icon-wrap { width: 56px; height: 56px; }
  .hero-sub { display: none; }
}
</style>
