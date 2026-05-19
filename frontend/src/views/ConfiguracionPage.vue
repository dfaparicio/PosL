<template>
  <MainLayout>
    <div class="page-wrapper">

      <div class="page-header">
        <div class="page-title">Configuración</div>
        <div class="page-subtitle">Personaliza tu negocio y gestiona tus datos</div>
      </div>

      <div class="row q-col-gutter-md">

        <!-- Datos del negocio -->
        <div class="col-12 col-md-6">
          <div class="pc-card config-card">
            <div class="config-card-header row items-center q-gutter-x-sm">
              <div class="pc-icon-box" style="background: linear-gradient(135deg,#4F46E5,#7C3AED)">
                <q-icon name="store" color="white" size="18px" />
              </div>
              <span class="text-subtitle2 text-weight-bold text-dark">Datos del Negocio</span>
            </div>
            <div class="q-pa-md q-gutter-md">
              <q-input
                v-model="configStore.negocioNombre"
                outlined dense
                label="Nombre del Negocio"
                hint="Aparece en el encabezado y reportes"
              />
              <q-select
                v-model="configStore.moneda"
                outlined dense
                :options="opcionesMoneda"
                label="Moneda"
                emit-value map-options
              />
            </div>
          </div>
        </div>

        <!-- Respaldo de datos -->
        <div class="col-12 col-md-6">
          <div class="pc-card config-card">
            <div class="config-card-header row items-center q-gutter-x-sm">
              <div class="pc-icon-box" style="background: linear-gradient(135deg,#0284C7,#38BDF8)">
                <q-icon name="backup" color="white" size="18px" />
              </div>
              <span class="text-subtitle2 text-weight-bold text-dark">Respaldo de Datos</span>
            </div>
            <div class="q-pa-md">
              <div class="backup-grid">
                <q-btn
                  color="primary" icon="download"
                  label="Exportar Datos"
                  unelevated class="full-width"
                  @click="exportar"
                />
                <q-btn
                  color="secondary" icon="upload"
                  label="Importar Datos"
                  unelevated class="full-width"
                  @click="triggerImportar"
                />
                <q-btn
                  color="grey-7" icon="cloud_download"
                  label="Crear Backup"
                  unelevated class="full-width"
                  style="grid-column: 1 / -1"
                  @click="hacerBackup"
                />
              </div>
              <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="onFileSelected" />
            </div>
          </div>
        </div>

        <!-- Zona de peligro -->
        <div class="col-12">
          <div class="pc-card config-card danger-card">
            <div class="config-card-header row items-center q-gutter-x-sm">
              <div class="pc-icon-box" style="background: linear-gradient(135deg,#DC2626,#EF4444)">
                <q-icon name="warning" color="white" size="18px" />
              </div>
              <span class="text-subtitle2 text-weight-bold text-negative">Zona de Peligro</span>
            </div>
            <div class="q-pa-md row items-center justify-between q-gutter-md">
              <div>
                <div class="text-body2 text-weight-bold text-dark">Resetear todos los datos</div>
                <div class="text-caption text-grey-6">
                  Elimina permanentemente todas las ventas, el historial de caja y deja el sistema en cero.
                  Esta acción <strong>no se puede deshacer</strong>.
                </div>
              </div>
              <q-btn
                color="negative"
                icon="delete_forever"
                label="Resetear Todo"
                unelevated
                @click="confirmarReset"
              />
            </div>
          </div>
        </div>

        <!-- Acerca de -->
        <div class="col-12 col-md-6">
          <div class="pc-card config-card">
            <div class="config-card-header row items-center q-gutter-x-sm">
              <div class="pc-icon-box" style="background: linear-gradient(135deg,#059669,#10B981)">
                <q-icon name="info" color="white" size="18px" />
              </div>
              <span class="text-subtitle2 text-weight-bold text-dark">Acerca de ProCuentas</span>
            </div>
            <div class="q-pa-md">
              <div class="about-list">
                <div class="about-row">
                  <span class="text-caption text-grey-6">Aplicación</span>
                  <span class="text-caption text-weight-bold text-dark">{{ APP_NAME }}</span>
                </div>
                <div class="about-row">
                  <span class="text-caption text-grey-6">Versión</span>
                  <q-badge color="primary" :label="APP_VERSION" />
                </div>
                <div class="about-row">
                  <span class="text-caption text-grey-6">Framework</span>
                  <span class="text-caption text-weight-medium">Vue 3 + Quasar</span>
                </div>
                <div class="about-row">
                  <span class="text-caption text-grey-6">Estado de Caja</span>
                  <q-chip
                    :color="cajaAbierta ? 'positive' : 'negative'"
                    text-color="white"
                    :icon="cajaAbierta ? 'lock_open' : 'lock'"
                    :label="cajaAbierta ? 'Abierta' : 'Cerrada'"
                    dense
                  />
                </div>
                <div class="about-row">
                  <span class="text-caption text-grey-6">Ventas Registradas</span>
                  <span class="text-caption text-weight-bold text-dark">{{ ventasStore.ventas.length }}</span>
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
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import MainLayout from '@/layouts/MainLayout.vue'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { useCajaStore } from '@/store/cajaStore'
import { useVentasStore } from '@/store/ventasStore'
import { usePersistencia } from '@/composables/usePersistencia'
import { APP_NAME, APP_VERSION } from '@/constants'

const $q = useQuasar()
const configStore = useConfiguracionStore()
const cajaStore = useCajaStore()
const ventasStore = useVentasStore()
const persistencia = usePersistencia()
const fileInputRef = ref(null)

const cajaAbierta = computed(() => cajaStore.cajaAbierta)

const opcionesMoneda = [
  { label: 'Peso Colombiano (COP)', value: 'COP' },
  { label: 'Dólar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' }
]

function exportar() {
  persistencia.exportarDatos()
  $q.notify({ type: 'positive', message: 'Datos exportados exitosamente', position: 'top' })
}

function triggerImportar() { fileInputRef.value?.click() }

function onFileSelected(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = persistencia.importarDatos(e.target.result)
      $q.notify({
        type: result.success ? 'positive' : 'negative',
        message: result.success ? 'Datos importados exitosamente' : `Error: ${result.error}`,
        position: 'top'
      })
    } catch {
      $q.notify({ type: 'negative', message: 'El archivo no tiene un formato válido', position: 'top' })
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

function hacerBackup() {
  persistencia.hacerBackup()
  $q.notify({ type: 'positive', message: 'Backup creado exitosamente', position: 'top' })
}

function confirmarReset() {
  $q.dialog({
    title: '⚠️ Resetear todos los datos',
    message: 'Se eliminarán permanentemente <strong>todas las ventas, el historial de caja y los movimientos</strong>. El sistema quedará en cero como si fuera nuevo.<br><br>¿Estás completamente seguro?',
    html: true,
    ok: { label: 'Sí, resetear todo', color: 'negative', unelevated: true, icon: 'delete_forever' },
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    persistent: true,
  }).onOk(() => {
    localStorage.clear()
    $q.notify({ type: 'positive', message: 'Sistema reiniciado. Recargando...', position: 'top', timeout: 1500 })
    setTimeout(() => window.location.reload(), 1600)
  })
}
</script>

<style scoped>
.hidden { display: none; }

.config-card {
  height: 100%;
}

.config-card-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--pc-border);
}

.backup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.about-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(79,70,229,0.06);
}

.about-row:last-child { border-bottom: none; }

.danger-card {
  border: 1.5px solid rgba(220, 38, 38, 0.25) !important;
}
</style>
