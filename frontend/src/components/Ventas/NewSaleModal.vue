<template>
  <q-dialog v-model="model" persistent maximized>
    <q-card class="pos-card">

      <!-- ══ HEADER ══════════════════════════════════════════════ -->
      <div class="pos-header">
        <div class="pos-header-icon">
          <q-icon name="point_of_sale" size="20px" color="white" />
        </div>
        <div class="q-ml-sm">
          <div class="pos-header-title">Nueva Venta</div>
          <div class="pos-header-sub">Selecciona categoría → completa detalles → agrega al carrito</div>
        </div>
        <q-space />
        <q-btn flat icon="close" color="grey-5" v-close-popup round :disable="loading" size="md">
          <q-tooltip>Cancelar</q-tooltip>
        </q-btn>
      </div>

      <!-- ══ BODY: 3 columnas ═══════════════════════════════════ -->
      <div class="pos-body">

        <!-- ── Columna 1: Categorías ──────────────────────────── -->
        <div class="col-categorias">
          <div class="col-title">
            <q-icon name="grid_view" size="13px" color="grey-5" />
            Categorías
          </div>

          <q-input
            v-model="busquedaCat"
            outlined dense
            placeholder="Buscar..."
            clearable
            class="cat-search"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="14px" color="grey-5" />
            </template>
          </q-input>

          <div class="cat-grid">
            <div v-if="categoriasBuscadas.length === 0" class="cat-empty">
              <q-icon name="search_off" size="36px" color="grey-4" />
              <div>Sin resultados</div>
            </div>
            <div
              v-for="cat in categoriasBuscadas" :key="cat.value"
              class="cat-card" :class="{ 'cat-card--selected': catActiva === cat.value }"
              @click="seleccionarCategoria(cat)"
            >
              <q-icon :name="cat.icon" size="32px" />
              <span>{{ cat.label }}</span>
            </div>
          </div>
        </div>

        <!-- ── Columna 2: Formulario del ítem ────────────────── -->
        <div class="col-formulario">

          <!-- Vacío: ninguna categoría seleccionada -->
          <div v-if="!catActiva" class="form-empty">
            <div class="form-empty-arrow">←</div>
            <div class="form-empty-title">Selecciona una categoría</div>
            <div class="form-empty-sub">Elige el tipo de prenda en el panel izquierdo para comenzar</div>
          </div>

          <!-- Formulario activo -->
          <div v-else class="form-inner">

            <!-- Header categoría seleccionada -->
            <div class="form-cat-header">
              <div class="form-cat-dot" :style="{ background: catActivaColor }">
                <q-icon :name="catActivaObj?.icon || 'checkroom'" size="16px" color="white" />
              </div>
              <span class="form-cat-name">{{ catActiva }}</span>
              <q-btn
                flat dense round icon="close" size="xs" color="grey-5"
                class="q-ml-auto"
                @click="cancelarForm"
              >
                <q-tooltip>Cambiar categoría</q-tooltip>
              </q-btn>
            </div>

            <div class="form-scroll">

              <!-- ── Colores ── -->
              <div class="form-section">
                <div class="form-section-label">Color</div>
                <div class="color-grid">
                  <button
                    v-for="c in colores" :key="c.value"
                    class="color-bubble"
                    :class="{ 'color-bubble--sel': formItem.colorSel === c.value }"
                    :style="{ background: c.hex }"
                    :title="c.label"
                    @click="toggleColor(c.value)"
                  >
                    <q-icon v-if="formItem.colorSel === c.value" name="check" size="12px"
                      :color="c.dark ? 'white' : 'grey-9'" />
                    <q-tooltip>{{ c.label }}</q-tooltip>
                  </button>
                </div>
                <div v-if="formItem.colorSel" class="sel-tag">
                  <span class="sel-dot" :style="{ background: colores.find(c=>c.value===formItem.colorSel)?.hex }" />
                  {{ formItem.colorSel }}
                  <q-btn flat dense round icon="close" size="xs" color="grey-5" @click="formItem.colorSel = null" />
                </div>
              </div>

              <!-- ── Tallas ── -->
              <div class="form-section">
                <div class="form-section-label">Talla</div>
                <div class="talla-row q-mb-xs">
                  <button
                    v-for="t in tallasLetras" :key="t"
                    class="talla-chip" :class="{ 'talla-chip--sel': formItem.tallaSel === t }"
                    @click="toggleTalla(t)"
                  >{{ t }}</button>
                </div>
                <div class="talla-row">
                  <button
                    v-for="t in tallasNumeros" :key="t"
                    class="talla-chip" :class="{ 'talla-chip--sel': formItem.tallaSel === t }"
                    @click="toggleTalla(t)"
                  >{{ t }}</button>
                </div>
              </div>

              <!-- ── Referencia / detalle ── -->
              <div class="form-section">
                <div class="form-section-label">
                  Descripción adicional
                  <span class="optional-tag">opcional</span>
                </div>
                <q-input
                  v-model="formItem.extraDesc"
                  outlined dense
                  placeholder="Ej: manga larga, slim fit, estampado..."
                />
                <!-- Preview de referencia -->
                <div v-if="referenciaAuto" class="ref-preview">
                  <q-icon name="label_outline" size="13px" color="primary" />
                  <span>{{ referenciaAuto }}</span>
                </div>
              </div>

              <!-- ── Precio y cantidad ── -->
              <div class="form-section">
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <div class="form-section-label">Precio *</div>
                    <q-input
                      v-model.number="formItem.precio"
                      outlined type="number"
                      prefix="$"
                      :rules="[v => v > 0 || 'Requerido']"
                      input-style="font-weight:var(--pc-weight-extra);font-size:var(--pc-text-lg)"
                      autofocus
                    />
                  </div>
                  <div class="col-6">
                    <div class="form-section-label">Cantidad *</div>
                    <q-input
                      v-model.number="formItem.cantidad"
                      outlined type="number"
                      :rules="[v => v > 0 || 'Requerido']"
                      input-style="font-weight:var(--pc-weight-extra);font-size:var(--pc-text-lg)"
                    />
                  </div>
                </div>
              </div>

              <!-- ── Descuento ── -->
              <div class="form-section">
                <div class="form-section-label">Descuento rápido</div>
                <div class="disc-row">
                  <button
                    v-for="pct in [5, 10, 15, 20]" :key="pct"
                    class="disc-chip" :class="{ active: descuentoPct === pct }"
                    :disabled="!formItem.precio"
                    @click="aplicarDescuento(pct)"
                  >{{ pct }}%</button>
                  <button v-if="descuentoPct" class="disc-chip clear" @click="limpiarDescuento">✕ Quitar</button>
                  <span v-if="formItem.descuento > 0" class="disc-val">−{{ formatCurrency(formItem.descuento) }}</span>
                </div>
              </div>

              <!-- ── Promoción ── -->
              <div class="form-section">
                <div class="promo-toggle">
                  <q-icon name="local_offer" size="18px" :color="formItem.esPromocion ? 'warning' : 'grey-4'" />
                  <div>
                    <div class="promo-title">Artículo en promoción</div>
                    <div class="promo-sub">Marca la venta con etiqueta de oferta</div>
                  </div>
                  <q-space />
                  <q-toggle v-model="formItem.esPromocion" color="warning" size="md" />
                </div>
              </div>

            </div><!-- /form-scroll -->

            <!-- Footer fijo: subtotal + botón -->
            <div class="form-footer">
              <div class="form-subtotal">
                <span class="form-subtotal-label">Subtotal</span>
                <span class="form-subtotal-val">{{ formatCurrency(subtotalItem) }}</span>
              </div>
              <q-btn
                color="primary"
                icon="add_shopping_cart"
                label="Agregar al carrito"
                :disable="!itemValido"
                unelevated
                class="agregar-btn"
                @click="agregarAlCarrito"
              />
            </div>

          </div>
        </div>

        <!-- ── Columna 3: Carrito ──────────────────────────────── -->
        <div class="col-carrito">

          <div v-if="carrito.length === 0" class="carrito-empty">
            <q-icon name="shopping_cart_checkout" size="48px" color="grey-3" />
            <div class="carrito-empty-title">Carrito vacío</div>
            <div class="carrito-empty-sub">Los ítems que agregues aparecerán aquí</div>
          </div>

          <template v-else>
            <div class="carrito-header">
              <q-icon name="shopping_cart" size="15px" color="primary" />
              <span>{{ carrito.length }} ítem{{ carrito.length > 1 ? 's' : '' }}</span>
              <q-space />
              <q-btn flat dense no-caps size="xs" color="negative" icon="delete_sweep"
                @click="vaciarCarrito">
                <q-tooltip>Vaciar carrito</q-tooltip>
              </q-btn>
            </div>

            <div class="carrito-list">
              <div v-for="(item, i) in carrito" :key="i" class="carrito-item">
                <div class="carrito-item-top">
                  <div class="carrito-item-cat">
                    <span v-if="item.colorHex" class="color-dot-mini" :style="{ background: item.colorHex }" />
                    {{ item.categoria }}
                    <q-badge v-if="item.esPromocion" color="warning" label="PROMO" dense class="q-ml-xs" />
                  </div>
                  <q-btn flat dense round icon="close" size="xs" color="grey-4" @click="quitarItem(i)" />
                </div>
                <div v-if="item.referencia" class="carrito-item-ref">{{ item.referencia }}</div>
                <div class="carrito-item-meta">
                  <span class="carrito-precio-unit">{{ formatCurrency(item.precio) }}</span>
                  <div class="qty-ctrl">
                    <button class="qty-btn" @click="cambiarCantidad(i,-1)" :disabled="item.cantidad<=1">−</button>
                    <span class="qty-num">{{ item.cantidad }}</span>
                    <button class="qty-btn" @click="cambiarCantidad(i,1)">+</button>
                  </div>
                  <q-space />
                  <span class="carrito-sub">{{ formatCurrency(item.subtotal) }}</span>
                </div>
                <div v-if="item.descuento > 0" class="carrito-desc">Desc: −{{ formatCurrency(item.descuento) }}</div>
              </div>
            </div>

            <div class="carrito-footer">
              <div class="total-row">
                <span class="total-label">Total</span>
                <span class="total-val">{{ formatCurrency(totalCarrito) }}</span>
              </div>

              <div class="form-section-label q-mb-xs">Método de pago *</div>
              <div class="pago-row">
                <button
                  v-for="m in opcionesMetodoPago" :key="m.value"
                  class="pago-btn" :class="{ active: metodoPago===m.value, [`pago-${m.value}`]: true }"
                  @click="metodoPago = m.value"
                >
                  <q-icon :name="m.icon" size="15px" />
                  <span>{{ m.label }}</span>
                </button>
              </div>

              <q-input v-model="observacion" outlined dense label="Observación (opcional)" class="q-mb-sm" />

              <q-btn
                color="positive" icon="save"
                label="Registrar Venta"
                :disable="carrito.length===0 || !metodoPago"
                :loading="loading"
                unelevated class="full-width registrar-btn"
                @click="registrarVenta"
              />
            </div>
          </template>
        </div>

      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useVentasStore } from '@/store/ventasStore'
import { useCajaStore } from '@/store/cajaStore'
import { formatCurrency } from '@/common/format'

const emit = defineEmits(['saleCreated'])
const $q = useQuasar()
const ventasStore = useVentasStore()
const cajaStore   = useCajaStore()

const model       = ref(false)
const loading     = ref(false)
const busquedaCat = ref('')
const carrito     = ref([])
const metodoPago  = ref('efectivo')
const observacion = ref('')
const catActiva   = ref(null)
const catActivaObj = ref(null)
const descuentoPct = ref(null)

const formItem = ref({
  colorSel: null, tallaSel: null, extraDesc: '',
  precio: null, cantidad: 1, descuento: 0, esPromocion: false
})

/* ─── Colores ─── */
const colores = [
  { label: 'Blanco',      value: 'Blanco',      hex: '#F3F4F6', dark: false },
  { label: 'Negro',       value: 'Negro',        hex: '#111827', dark: true  },
  { label: 'Gris',        value: 'Gris',         hex: '#9CA3AF', dark: false },
  { label: 'Azul',        value: 'Azul',         hex: '#2563EB', dark: true  },
  { label: 'Azul marino', value: 'Azul marino',  hex: '#1E3A8A', dark: true  },
  { label: 'Rojo',        value: 'Rojo',         hex: '#DC2626', dark: true  },
  { label: 'Verde',       value: 'Verde',        hex: '#16A34A', dark: true  },
  { label: 'Amarillo',    value: 'Amarillo',     hex: '#FBBF24', dark: false },
  { label: 'Rosa',        value: 'Rosa',         hex: '#EC4899', dark: true  },
  { label: 'Naranja',     value: 'Naranja',      hex: '#F97316', dark: true  },
  { label: 'Morado',      value: 'Morado',       hex: '#9333EA', dark: true  },
  { label: 'Café',        value: 'Café',         hex: '#92400E', dark: true  },
  { label: 'Beige',       value: 'Beige',        hex: '#D4B48C', dark: false },
  { label: 'Vino',        value: 'Vino',         hex: '#7F1D1D', dark: true  },
  { label: 'Turquesa',    value: 'Turquesa',     hex: '#0D9488', dark: true  },
  { label: 'Fucsia',      value: 'Fucsia',       hex: '#DB2777', dark: true  },
]

/* ─── Tallas ─── */
const tallasLetras  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const tallasNumeros = ['28', '30', '32', '34', '36', '38', '40', '42', '44']

/* ─── Categorías ─── */
const categorias = [
  { label: 'Camisas',     value: 'Camisas',     icon: 'checkroom' },
  { label: 'Pantalones',  value: 'Pantalones',  icon: 'straighten' },
  { label: 'Vestidos',    value: 'Vestidos',    icon: 'dry_cleaning' },
  { label: 'Chaquetas',   value: 'Chaquetas',   icon: 'wb_cloudy' },
  { label: 'Faldas',      value: 'Faldas',      icon: 'straighten' },
  { label: 'Shorts',      value: 'Shorts',      icon: 'straighten' },
  { label: 'Zapatos',     value: 'Zapatos',     icon: 'steps' },
  { label: 'Accesorios',  value: 'Accesorios',  icon: 'shopping_bag' },
  { label: 'Deportivo',   value: 'Deportivo',   icon: 'fitness_center' },
  { label: 'Otro',        value: 'Otro',        icon: 'add_circle_outline' },
]

const CAT_COLORS = ['#4F46E5','#0284C7','#7C3AED','#0D9488','#D97706','#DC2626']

const categoriasBuscadas = computed(() => {
  if (!busquedaCat.value) return categorias
  const q = busquedaCat.value.toLowerCase()
  return categorias.filter(c => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q))
})

const catActivaColor = computed(() => {
  const idx = categorias.findIndex(c => c.value === catActiva.value)
  return CAT_COLORS[Math.max(0, idx) % CAT_COLORS.length]
})

const opcionesMetodoPago = [
  { label: 'Efectivo',      value: 'efectivo',      icon: 'payments'    },
  { label: 'Transferencia', value: 'transferencia', icon: 'swap_horiz'  },
  { label: 'Tarjeta',       value: 'tarjeta',       icon: 'credit_card' },
]

/* ─── Referencia auto ─── */
const referenciaAuto = computed(() => {
  const p = []
  if (formItem.value.colorSel) p.push(formItem.value.colorSel)
  if (formItem.value.tallaSel) p.push(`Talla ${formItem.value.tallaSel}`)
  if (formItem.value.extraDesc?.trim()) p.push(formItem.value.extraDesc.trim())
  return p.join(' · ')
})

/* ─── Cálculos ─── */
const subtotalItem = computed(() =>
  Math.max(0, (formItem.value.precio || 0) * (formItem.value.cantidad || 1) - (formItem.value.descuento || 0))
)

const itemValido = computed(() =>
  catActiva.value && (formItem.value.precio || 0) > 0 && (formItem.value.cantidad || 0) > 0
)

const totalCarrito = computed(() =>
  carrito.value.reduce((s, i) => s + i.subtotal, 0)
)

/* ─── Acciones ─── */
function toggleColor(val) { formItem.value.colorSel = formItem.value.colorSel === val ? null : val }
function toggleTalla(val) { formItem.value.tallaSel = formItem.value.tallaSel === val ? null : val }

function aplicarDescuento(pct) {
  if (!formItem.value.precio) return
  if (descuentoPct.value === pct) { limpiarDescuento(); return }
  descuentoPct.value = pct
  formItem.value.descuento = Math.round(
    (formItem.value.precio * (formItem.value.cantidad || 1)) * (pct / 100)
  )
}
function limpiarDescuento() { descuentoPct.value = null; formItem.value.descuento = 0 }

watch(() => [formItem.value.precio, formItem.value.cantidad], () => {
  if (descuentoPct.value) aplicarDescuento(descuentoPct.value)
})

function seleccionarCategoria(cat) {
  catActiva.value    = cat.value
  catActivaObj.value = cat
  formItem.value = { colorSel: null, tallaSel: null, extraDesc: '', precio: null, cantidad: 1, descuento: 0, esPromocion: false }
  descuentoPct.value = null
}

function cancelarForm() {
  catActiva.value    = null
  catActivaObj.value = null
  descuentoPct.value = null
  formItem.value = { colorSel: null, tallaSel: null, extraDesc: '', precio: null, cantidad: 1, descuento: 0, esPromocion: false }
}

function agregarAlCarrito() {
  if (!itemValido.value) return
  const colorObj = colores.find(c => c.value === formItem.value.colorSel)
  carrito.value.push({
    categoria:   catActiva.value,
    referencia:  referenciaAuto.value,
    colorHex:    colorObj?.hex || null,
    precio:      formItem.value.precio,
    cantidad:    formItem.value.cantidad,
    descuento:   formItem.value.descuento,
    esPromocion: formItem.value.esPromocion,
    subtotal:    subtotalItem.value
  })
  // Limpiar sólo el form, mantener categoría para agregar rápido otro del mismo tipo
  formItem.value = { colorSel: null, tallaSel: null, extraDesc: '', precio: null, cantidad: 1, descuento: 0, esPromocion: false }
  descuentoPct.value = null
}

function quitarItem(i) { carrito.value.splice(i, 1) }

function vaciarCarrito() {
  $q.dialog({
    message: '¿Vaciar todo el carrito?',
    ok: { label: 'Sí, vaciar', color: 'negative', unelevated: true },
    cancel: { label: 'Cancelar', flat: true }
  }).onOk(() => { carrito.value = [] })
}

function cambiarCantidad(i, delta) {
  const item = carrito.value[i]
  const nc = (item.cantidad || 1) + delta
  if (nc < 1) return
  item.cantidad = nc
  item.subtotal = Math.max(0, item.precio * nc - (item.descuento || 0))
}

function abrir() {
  if (!cajaStore.cajaAbierta) {
    $q.notify({ type: 'warning', message: 'Abre la caja primero para registrar ventas', position: 'top', icon: 'lock' })
    return
  }
  carrito.value = []; metodoPago.value = 'efectivo'; observacion.value = ''; busquedaCat.value = ''
  cancelarForm()
  model.value = true
}

async function registrarVenta() {
  if (!carrito.value.length || !metodoPago.value) return
  loading.value = true
  try {
    await ventasStore.crearVenta({
      items: carrito.value.map(i => ({
        categoria: i.categoria, referencia: i.referencia,
        precio: i.precio, cantidad: i.cantidad,
        descuento: i.descuento, esPromocion: i.esPromocion
      })),
      metodoPago:  metodoPago.value,
      observacion: observacion.value.trim() || 'N/A'
    })
    const n = carrito.value.length
    $q.notify({ type: 'positive', message: n === 1 ? '¡Venta registrada!' : `¡Venta con ${n} ítems!`, position: 'top', timeout: 2000 })
    model.value = false
    emit('saleCreated')
  } catch (err) {
    $q.notify({ type: 'negative', message: err?.message || 'Error al registrar la venta', position: 'top' })
  } finally {
    loading.value = false
  }
}

defineExpose({ abrir })
</script>

<style scoped>
/* ══ Estructura base ══ */
.pos-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--pc-surface-variant);
}

/* ── Header ── */
.pos-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  background: var(--pc-surface);
  border-bottom: 1px solid var(--pc-border);
  flex-shrink: 0;
}

.pos-header-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 12px rgba(79,70,229,0.35);
}

.pos-header-title {
  font-size: var(--pc-text-xl);
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
  line-height: 1.1;
}

.pos-header-sub {
  font-size: var(--pc-text-md);
  color: var(--pc-text-hint);
}

/* ── Body: 3 columnas IGUALES ── */
.pos-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ══════════════════════════════
   COLUMNA 1 — Categorías
═════════════════════════════ */
.col-categorias {
  flex: 0.65;
  min-width: 240px;
  border-right: 1px solid var(--pc-border);
  display: flex;
  flex-direction: column;
  background: var(--pc-surface);
  overflow: hidden;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px 8px;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-extra);
  text-transform: uppercase;
  letter-spacing: var(--pc-tracking-wide);
  color: var(--pc-text-hint);
  flex-shrink: 0;
}

.cat-search { padding: 0 12px 8px; flex-shrink: 0; }

.cat-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px 12px 12px;
  align-content: start;
}

.cat-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 16px;
  color: var(--pc-text-muted);
  font-size: var(--pc-text-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 8px;
  border-radius: 12px;
  border: 2px solid var(--pc-border);
  background: var(--pc-surface);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-muted);
  min-height: 80px;
}

.cat-card:hover {
  border-color: var(--q-primary);
  color: var(--q-primary);
  background: rgba(79,70,229,0.04);
  transform: translateY(-1px);
  box-shadow: var(--pc-shadow-sm);
}

.cat-card--selected {
  background: var(--q-primary) !important;
  border-color: var(--q-primary) !important;
  color: white !important;
  box-shadow: 0 4px 16px rgba(79,70,229,0.35) !important;
  transform: translateY(-2px);
}

/* ══════════════════════════════
   COLUMNA 2 — Formulario
═════════════════════════════ */
.col-formulario {
  flex: 1;
  min-width: 320px;
  border-right: 1px solid var(--pc-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--pc-surface-variant);
}

.form-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--pc-text-disabled);
  text-align: center;
  padding: 48px;
}

.form-empty-arrow {
  font-size: var(--pc-text-stat-xl);
  font-weight: var(--pc-weight-light);
  color: var(--pc-text-faint);
  animation: arrow-pulse 1.6s ease-in-out infinite;
}

@keyframes arrow-pulse {
  0%, 100% { transform: translateX(0); opacity: 0.5; }
  50%       { transform: translateX(-10px); opacity: 1; }
}

.form-empty-title {
  font-size: var(--pc-text-xl);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-hint);
}

.form-empty-sub {
  font-size: var(--pc-text-md);
  color: var(--pc-text-disabled);
  max-width: 280px;
}

.form-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-cat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: var(--pc-surface);
  border-bottom: 1px solid var(--pc-border);
  flex-shrink: 0;
}

.form-cat-dot {
  width: 34px; height: 34px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.form-cat-name {
  font-size: var(--pc-text-lg);
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.form-section { margin-bottom: 24px; }

.form-section-label {
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-extra);
  text-transform: uppercase;
  letter-spacing: var(--pc-tracking-wide);
  color: var(--pc-text-hint);
  margin-bottom: 10px;
  display: block;
}

.optional-tag {
  font-weight: var(--pc-weight-regular);
  text-transform: none;
  letter-spacing: var(--pc-tracking-normal);
  font-size: var(--pc-text-sm);
  color: var(--pc-text-disabled);
  margin-left: 4px;
}

/* Colores */
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-bubble {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.12);
  outline: none;
  flex-shrink: 0;
}

.color-bubble:hover { transform: scale(1.2); box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.2); }

.color-bubble--sel {
  border-color: #4F46E5 !important;
  box-shadow: 0 0 0 4px rgba(79,70,229,0.25), inset 0 0 0 1px rgba(0,0,0,0.1);
  transform: scale(1.15);
}

.sel-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-semi);
  color: var(--q-primary);
  background: rgba(79,70,229,0.08);
  border-radius: 20px;
  padding: 5px 10px 5px 6px;
}

.sel-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid rgba(0,0,0,0.1);
}

/* Tallas */
.talla-row { display: flex; flex-wrap: wrap; gap: 8px; }

.talla-chip {
  padding: 8px 16px;
  border-radius: 9px;
  border: 1.5px solid var(--pc-border);
  background: var(--pc-surface);
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-muted);
  cursor: pointer;
  transition: all 0.12s;
  line-height: var(--pc-lh-tight);
}

.talla-chip:hover { border-color: var(--q-primary); color: var(--q-primary); background: rgba(79,70,229,0.04); }

.talla-chip--sel {
  background: var(--q-primary);
  border-color: var(--q-primary);
  color: white;
  box-shadow: 0 2px 10px rgba(79,70,229,0.35);
}

.ref-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-semi);
  color: var(--q-primary);
  background: rgba(79,70,229,0.07);
  border-radius: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(79,70,229,0.15);
}

/* Descuento */
.disc-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.disc-chip {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--pc-border);
  background: var(--pc-surface);
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-muted);
  cursor: pointer;
  transition: all 0.12s;
}
.disc-chip:hover:not(:disabled) { border-color: var(--q-warning); color: var(--q-warning); }
.disc-chip.active { background: var(--q-warning); border-color: var(--q-warning); color: white; }
.disc-chip.clear  { border-color: var(--pc-text-faint); color: var(--pc-text-hint); font-size: var(--pc-text-sm); }
.disc-chip:disabled { opacity: 0.3; cursor: not-allowed; }
.disc-val { font-size: var(--pc-text-md); color: var(--q-negative); font-weight: var(--pc-weight-bold); }

/* Promo */
.promo-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(217,119,6,0.04);
  border: 1.5px dashed rgba(217,119,6,0.2);
  border-radius: 12px;
  padding: 14px 16px;
}

.promo-title {
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-semi);
  color: var(--pc-text-body);
}

.promo-sub {
  font-size: var(--pc-text-sm);
  color: var(--pc-text-hint);
}

/* Footer del formulario */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 28px;
  background: var(--pc-surface);
  border-top: 2px solid var(--pc-border);
  flex-shrink: 0;
}

.form-subtotal { display: flex; flex-direction: column; gap: 4px; }

.form-subtotal-label {
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--pc-tracking-wide);
  color: var(--pc-text-hint);
}

.form-subtotal-val {
  font-size: var(--pc-text-xl);
  font-weight: var(--pc-weight-black);
  color: var(--q-primary);
  font-variant-numeric: tabular-nums;
  line-height: var(--pc-lh-none);
}

.agregar-btn {
  height: 48px;
  padding: 0 24px !important;
  font-size: var(--pc-text-md) !important;
  font-weight: var(--pc-weight-bold) !important;
  border-radius: 10px !important;
  white-space: nowrap;
}

/* ══════════════════════════════
   COLUMNA 3 — Carrito
═════════════════════════════ */
.col-carrito {
  flex: 0.65;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  background: var(--pc-surface);
  overflow: hidden;
}

.carrito-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  text-align: center;
}

.carrito-empty-title {
  font-size: var(--pc-text-lg);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-hint);
}

.carrito-empty-sub {
  font-size: var(--pc-text-md);
  color: var(--pc-text-disabled);
  max-width: 200px;
}

.carrito-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--pc-border);
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-bold);
  color: var(--q-primary);
  flex-shrink: 0;
}

.carrito-list { flex: 1; overflow-y: auto; padding: 6px 0; }

.carrito-item {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(79,70,229,0.06);
}
.carrito-item:last-child { border-bottom: none; }
.carrito-item:hover { background: rgba(79,70,229,0.02); }

.carrito-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.carrito-item-cat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-primary);
}

.color-dot-mini {
  width: 14px; height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid rgba(0,0,0,0.12);
}

.carrito-item-ref {
  font-size: var(--pc-text-sm);
  color: var(--pc-text-hint);
  padding-left: 2px;
  margin-bottom: 6px;
}

.carrito-item-desc {
  font-size: var(--pc-text-sm);
  color: var(--q-negative);
  margin-top: 2px;
}

.carrito-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.carrito-precio-unit {
  font-size: var(--pc-text-sm);
  color: var(--pc-text-hint);
  font-variant-numeric: tabular-nums;
}

.qty-ctrl {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--pc-border);
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 28px; height: 28px;
  border: none;
  background: var(--pc-surface-variant);
  cursor: pointer;
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-body);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.1s;
  line-height: var(--pc-lh-none);
}
.qty-btn:hover:not(:disabled) { background: rgba(79,70,229,0.1); color: var(--q-primary); }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.qty-num {
  min-width: 28px;
  text-align: center;
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
}

.carrito-sub {
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-extra);
  color: var(--pc-text-primary);
  font-variant-numeric: tabular-nums;
}

/* Footer del carrito */
.carrito-footer {
  padding: 16px;
  border-top: 2px solid var(--pc-border);
  flex-shrink: 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.total-label {
  font-size: var(--pc-text-lg);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-body);
}

.total-val {
  font-size: var(--pc-text-2xl);
  font-weight: var(--pc-weight-black);
  color: var(--q-primary);
  font-variant-numeric: tabular-nums;
}

/* Método de pago */
.pago-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.pago-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 10px;
  border: 2px solid var(--pc-border);
  background: var(--pc-surface-variant);
  cursor: pointer;
  font-size: var(--pc-text-md);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-muted);
  transition: all 0.12s;
}
.pago-btn:hover { border-color: var(--q-primary); color: var(--q-primary); background: rgba(79,70,229,0.04); }
.pago-btn.active.pago-efectivo      { background: var(--q-positive); border-color: var(--q-positive); color: white; }
.pago-btn.active.pago-transferencia { background: var(--q-info);     border-color: var(--q-info);     color: white; }
.pago-btn.active.pago-tarjeta       { background: var(--q-accent);   border-color: var(--q-accent);   color: white; }

/* Botón registrar venta */
.registrar-btn {
  height: 50px;
  font-size: var(--pc-text-lg) !important;
  font-weight: var(--pc-weight-extra) !important;
  border-radius: 10px !important;
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35) !important;
}

/* ══════════════════════════════
   Mobile responsive
═════════════════════════════ */
@media (max-width: 900px) {
  .pos-body { flex-direction: column; }
  .col-categorias { flex: none; height: auto; min-width: 0; border-right: none; border-bottom: 1px solid var(--pc-border); }
  .cat-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 6px; padding: 8px 10px; }
  .cat-card { min-height: 64px; padding: 12px 6px; }
  .col-carrito { flex: none; min-width: 0; }
  .col-formulario { min-width: 0; border-right: none; }
  .pos-header { height: 52px; padding: 0 14px; }
  .pos-header-title { font-size: var(--pc-text-lg); }
  .pos-header-sub { font-size: var(--pc-text-sm); }
}
</style>
