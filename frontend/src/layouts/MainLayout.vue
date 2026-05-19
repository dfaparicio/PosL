<template>
  <q-layout view="hHh Lpr lFf">

    <!-- ── Header frosted glass ─────────────────────────────── -->
    <q-header class="app-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="text-grey-8"
          @click="toggleLeftDrawer"
        >
          <q-tooltip>Abrir/cerrar menú</q-tooltip>
        </q-btn>

        <q-toolbar-title class="text-dark text-weight-medium">
          {{ configuracionStore.negocioNombre }}
          <span class="text-grey-6 text-caption q-ml-xs">— SystemPos</span>
        </q-toolbar-title>

        <div class="row items-center q-gutter-x-sm">
          <div class="column items-end">
            <span class="text-caption text-grey-7 lh-1">{{ fechaActual }}</span>
            <span class="text-caption text-weight-medium text-grey-9 lh-1">{{ horaActual }}</span>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- ── Sidebar premium ──────────────────────────────────── -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="248"
      class="sidebar-drawer"
    >
      <!-- Logo area -->
      <div class="column items-center q-pt-lg q-pb-md q-px-md">
        <div class="logo-icon-container">
          <q-icon name="point_of_sale" size="28px" color="white" />
        </div>
        <div class="text-white text-weight-bold text-subtitle1 q-mt-sm" style="letter-spacing: 0.3px;">
          {{ configuracionStore.negocioNombre }}
        </div>
        <div class="text-caption" style="color: rgba(255,255,255,0.45);">Sistema POS</div>
      </div>

      <div class="sidebar-divider" />

      <!-- Navigation -->
      <q-list class="q-mt-sm q-px-sm">
        <template v-if="cajaStore.cajaAbierta">
          <q-item
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            clickable
            v-ripple
            exact
            class="sidebar-nav-item"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section class="text-body2">{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <!-- Solo Caja cuando está cerrada -->
        <template v-else>
          <q-item
            to="/caja"
            clickable v-ripple exact
            class="sidebar-nav-item"
          >
            <q-item-section avatar>
              <q-icon name="account_balance" size="20px" />
            </q-item-section>
            <q-item-section class="text-body2">Caja</q-item-section>
          </q-item>

          <div class="sidebar-locked-msg q-mt-md q-mx-sm">
            <q-icon name="lock" size="16px" style="color: rgba(255,255,255,0.35)" />
            <span>Abre la caja para acceder al resto del sistema</span>
          </div>
        </template>
      </q-list>

      <div class="col-grow" />

      <!-- Botón Quiero Saber + versión -->
      <div class="q-px-md q-pb-sm q-mt-auto">
        <div class="sidebar-divider q-mb-sm" />

        <q-btn
          flat no-caps
          class="help-btn full-width"
          icon="help_outline"
          label="¿Cómo funciona?"
          @click="helpRef?.abrir()"
        />

        <div class="text-center q-mt-xs" style="color: rgba(255,255,255,0.25); font-size: var(--pc-text-3xs);">
          v{{ appVersion }}
        </div>
      </div>
    </q-drawer>

    <!-- ── Help Modal ─────────────────────────────────────────── -->
    <HelpModal ref="helpRef" />

    <!-- ── Content ───────────────────────────────────────────── -->
    <q-page-container>
      <q-page class="page-bg">
        <slot />
      </q-page>
    </q-page-container>

    <!-- ── Bottom nav (mobile only) ─────────────────────────── -->
    <q-footer v-if="$q.screen.lt.md" class="bg-white shadow-up-2">
      <q-tabs
        :model-value="currentRoute"
        indicator-color="primary"
        active-color="primary"
        align="justify"
        dense
      >
        <q-route-tab
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :icon="item.icon"
          :label="item.label"
          :name="item.path"
          exact
        />
      </q-tabs>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCajaStore } from '@/store/cajaStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { formatDate } from '@/common/format'
import { APP_VERSION } from '@/constants'
import HelpModal from '@/components/Shared/HelpModal.vue'

const $q = useQuasar()
const route = useRoute()
const leftDrawerOpen = ref(false)
const helpRef = ref(null)
const cajaStore = useCajaStore()
const configuracionStore = useConfiguracionStore()
const appVersion = APP_VERSION

const fechaActual = computed(() => formatDate(new Date()))
const currentRoute = computed(() => route.path)

const horaActual = ref('')
let clockInterval = null

function updateClock() {
  const now = new Date()
  horaActual.value = now.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})

const menuItems = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Ventas', path: '/ventas', icon: 'point_of_sale' },
  { label: 'Caja', path: '/caja', icon: 'account_balance' },
  { label: 'Historial', path: '/historial', icon: 'history' },
  { label: 'Estadísticas', path: '/estadisticas', icon: 'bar_chart' },
  { label: 'Configuración', path: '/configuracion', icon: 'settings' }
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
/* Header frosted glass */
.app-header {
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--pc-border);
  box-shadow: var(--pc-shadow-sm) !important;
}

/* Sidebar gradient */
:deep(.sidebar-drawer) {
  background: linear-gradient(180deg, #1E1B4B 0%, #2D2A6E 100%) !important;
  border-right: none !important;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.25) !important;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.10);
  margin: 0 12px;
}

/* Logo icon */
.logo-icon-container {
  width: 52px;
  height: 52px;
  background: var(--q-primary);
  border-radius: var(--pc-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.5);
}

/* Nav items */
.sidebar-nav-item {
  border-radius: 10px !important;
  margin: 1px 0 !important;
  color: rgba(255, 255, 255, 0.70) !important;
  transition: all 0.18s ease !important;
  min-height: 40px !important;
}

.sidebar-nav-item:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.10) !important;
}

.sidebar-nav-item.q-router-link--active {
  background: var(--q-primary) !important;
  color: white !important;
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.4) !important;
}


/* Mensaje caja bloqueada */
.sidebar-locked-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  font-size: var(--pc-text-xs);
  color: rgba(255,255,255,0.5);
  line-height: 1.4;
}

/* Botón de ayuda */
.help-btn {
  color: rgba(255,255,255,0.45) !important;
  font-size: var(--pc-text-xs) !important;
  border-radius: 8px !important;
  transition: all 0.15s !important;
}
.help-btn:hover {
  background: rgba(255,255,255,0.08) !important;
  color: rgba(255,255,255,0.85) !important;
}

/* Page background */
.page-bg {
  background: var(--pc-surface-variant);
  min-height: 100%;
}

/* Line height utility */
.lh-1 {
  line-height: 1.2;
}
</style>
