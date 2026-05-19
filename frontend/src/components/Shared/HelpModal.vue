<template>
  <q-dialog v-model="model" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="help-card">

      <!-- ── Header ── -->
      <div class="help-header">
        <div class="help-header-icon">
          <q-icon name="help_outline" size="22px" color="white" />
        </div>
        <div class="q-ml-sm">
          <div class="help-title">¿Cómo funciona SystemPos?</div>
          <div class="help-sub">Guía completa para usar el sistema</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
      </div>

      <!-- ── Contenido ── -->
      <div class="help-body">

        <!-- ─ Aviso de datos ─ -->
        <div class="help-notice">
          <q-icon name="info" size="18px" color="primary" />
          <span>Los datos se guardan automáticamente en este navegador. No se pierden al cerrar la pestaña, pero sí si borras el caché del navegador. Usa <strong>Exportar Datos</strong> en Configuración para hacer copias de seguridad.</span>
        </div>

        <!-- ─ Grid de secciones ─ -->
        <div class="help-grid">

          <!-- 1. Flujo del día -->
          <div class="help-section help-section--featured">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#4F46E5,#7C3AED)">
                <q-icon name="today" size="20px" color="white" />
              </div>
              <span class="help-section-title">Flujo del día — paso a paso</span>
            </div>
            <div class="help-steps">
              <div class="help-step">
                <div class="help-step-num">1</div>
                <div>
                  <div class="help-step-label">Abre la caja</div>
                  <div class="help-step-desc">Ve a <strong>Caja</strong> → "Abrir Caja" → ingresa el dinero físico con el que arrancas (el saldo del día anterior se precarga automáticamente).</div>
                </div>
              </div>
              <div class="help-step">
                <div class="help-step-num">2</div>
                <div>
                  <div class="help-step-label">Registra ventas</div>
                  <div class="help-step-desc">Ve a <strong>Ventas</strong> → botón grande o tecla <kbd>N</kbd> → selecciona categoría → completa precio, cantidad y método de pago → confirma.</div>
                </div>
              </div>
              <div class="help-step">
                <div class="help-step-num">3</div>
                <div>
                  <div class="help-step-label">Ingresos y retiros (opcional)</div>
                  <div class="help-step-desc">En <strong>Caja</strong> puedes registrar dinero que entra o sale de la caja sin ser una venta (abono de proveedor, retiro para gastos, etc.).</div>
                </div>
              </div>
              <div class="help-step">
                <div class="help-step-num">4</div>
                <div>
                  <div class="help-step-label">Cierra la caja</div>
                  <div class="help-step-desc">Al final del día → "Cerrar Caja" → cuenta el efectivo físico → el sistema muestra si hay sobrante o faltante. El monto contado se precarga para el siguiente día.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Dashboard -->
          <div class="help-section">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#059669,#10B981)">
                <q-icon name="dashboard" size="18px" color="white" />
              </div>
              <span class="help-section-title">Dashboard</span>
            </div>
            <div class="help-section-body">
              <p>Muestra un resumen de <strong>lo que va del día actual</strong>:</p>
              <ul>
                <li>Total vendido hoy (efectivo, transferencia, tarjeta)</li>
                <li>Artículos despachados</li>
                <li>Ticket promedio</li>
                <li>Top categorías más vendidas</li>
                <li>Estado actual de la caja (dinero esperado)</li>
                <li>Últimas ventas registradas</li>
              </ul>
              <div class="help-tip">
                <q-icon name="lightbulb" size="14px" color="warning" />
                Al día siguiente, el dashboard empieza en cero automáticamente.
              </div>
            </div>
          </div>

          <!-- 3. Ventas -->
          <div class="help-section">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#4F46E5,#7C3AED)">
                <q-icon name="point_of_sale" size="18px" color="white" />
              </div>
              <span class="help-section-title">Ventas</span>
            </div>
            <div class="help-section-body">
              <p>Aquí registras cada venta. Muestra <strong>las ventas de hoy</strong> por defecto.</p>
              <ul>
                <li><strong>Nueva venta:</strong> clic en el botón grande o presiona <kbd>N</kbd></li>
                <li>Selecciona la <strong>categoría</strong> de la prenda</li>
                <li>Elige color, talla y descripción (opcional)</li>
                <li>Ingresa precio, cantidad y descuento si aplica</li>
                <li>Puedes agregar varios ítems al carrito antes de confirmar</li>
                <li>Elige el <strong>método de pago</strong>: efectivo, transferencia o tarjeta</li>
              </ul>
              <div class="help-tip">
                <q-icon name="lightbulb" size="14px" color="warning" />
                Para ver ventas de otros días, borra el filtro de fecha o ve a Historial.
              </div>
            </div>
          </div>

          <!-- 4. Caja -->
          <div class="help-section">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#D97706,#FBBF24)">
                <q-icon name="account_balance_wallet" size="18px" color="white" />
              </div>
              <span class="help-section-title">Control de Caja</span>
            </div>
            <div class="help-section-body">
              <p>Controla el <strong>efectivo físico</strong> de tu negocio.</p>
              <ul>
                <li><strong>Abrir:</strong> registra con cuánto efectivo arrancas</li>
                <li><strong>Ingreso:</strong> dinero que entra a la caja (ej: cambio de billete, abono)</li>
                <li><strong>Retiro:</strong> dinero que sale (ej: pago de gasto, separar billete)</li>
                <li><strong>Cerrar:</strong> cuenta el efectivo físico real y el sistema calcula la diferencia</li>
              </ul>
              <div class="help-tip">
                <q-icon name="lightbulb" size="14px" color="warning" />
                Solo afecta al efectivo. Las transferencias y tarjetas no se cuentan en la caja física.
              </div>
            </div>
          </div>

          <!-- 5. Historial -->
          <div class="help-section">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#0284C7,#38BDF8)">
                <q-icon name="history" size="18px" color="white" />
              </div>
              <span class="help-section-title">Historial</span>
            </div>
            <div class="help-section-body">
              <p>Consulta <strong>todo el historial</strong> sin límite de fechas.</p>
              <ul>
                <li><strong>Ventas:</strong> listado completo con filtros por fecha, método y búsqueda</li>
                <li><strong>Movimientos:</strong> todos los ingresos y retiros de caja registrados</li>
                <li><strong>Resumen diario:</strong> agrupado por día con totales y desglose por método</li>
              </ul>
              <div class="help-tip">
                <q-icon name="lightbulb" size="14px" color="warning" />
                Los datos de hoy también aparecen aquí. El historial nunca se borra automáticamente.
              </div>
            </div>
          </div>

          <!-- 6. Estadísticas -->
          <div class="help-section">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#DC2626,#F87171)">
                <q-icon name="bar_chart" size="18px" color="white" />
              </div>
              <span class="help-section-title">Estadísticas</span>
            </div>
            <div class="help-section-body">
              <p>Gráficas y análisis sobre <strong>todo el historial acumulado</strong>.</p>
              <ul>
                <li>Distribución de ventas por hora del día</li>
                <li>Métodos de pago más usados (torta y barras)</li>
                <li>Ranking de categorías por monto vendido</li>
                <li>Ventas en promoción vs. precio normal</li>
                <li>Balance de caja actual</li>
              </ul>
            </div>
          </div>

          <!-- 7. Configuración -->
          <div class="help-section">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#6B7280,#9CA3AF)">
                <q-icon name="settings" size="18px" color="white" />
              </div>
              <span class="help-section-title">Configuración</span>
            </div>
            <div class="help-section-body">
              <ul>
                <li><strong>Nombre del negocio:</strong> aparece en el encabezado</li>
                <li><strong>Exportar datos:</strong> descarga un archivo JSON con todo el historial (úsalo como respaldo)</li>
                <li><strong>Importar datos:</strong> restaura un respaldo anterior</li>
                <li><strong>Crear Backup:</strong> igual a exportar, para guardar antes de borrar caché</li>
                <li><strong>Resetear todo:</strong> borra absolutamente todo y deja el sistema en cero</li>
              </ul>
              <div class="help-tip help-tip--danger">
                <q-icon name="warning" size="14px" color="negative" />
                "Resetear todo" es irreversible. Haz un backup antes.
              </div>
            </div>
          </div>

          <!-- 8. Preguntas frecuentes -->
          <div class="help-section help-section--full">
            <div class="help-section-header">
              <div class="help-section-icon" style="background: linear-gradient(135deg,#7C3AED,#A78BFA)">
                <q-icon name="quiz" size="18px" color="white" />
              </div>
              <span class="help-section-title">Preguntas frecuentes</span>
            </div>
            <div class="help-faq">
              <div class="faq-item">
                <div class="faq-q">¿Se pierden los datos si cierro el navegador?</div>
                <div class="faq-a">No. Los datos se guardan en el almacenamiento local del navegador. Se mantienen aunque cierres la pestaña o el navegador.</div>
              </div>
              <div class="faq-item">
                <div class="faq-q">¿Puedo abrir y cerrar la caja varias veces en el mismo día?</div>
                <div class="faq-a">Sí. Cada apertura es una sesión independiente. Los movimientos de sesiones anteriores se guardan en el historial.</div>
              </div>
              <div class="faq-item">
                <div class="faq-q">¿Por qué el Dashboard muestra en cero al día siguiente?</div>
                <div class="faq-a">Porque el Dashboard solo muestra las ventas del día actual. Las ventas de ayer aparecen en Historial → Resumen Diario.</div>
              </div>
              <div class="faq-item">
                <div class="faq-q">¿Qué pasa si registro una venta en efectivo con la caja cerrada?</div>
                <div class="faq-a">El sistema no lo permite. Debes abrir la caja primero. Las ventas en transferencia y tarjeta sí se pueden registrar con caja cerrada.</div>
              </div>
              <div class="faq-item">
                <div class="faq-q">¿Cómo recupero mis datos en otro dispositivo?</div>
                <div class="faq-a">Exporta los datos desde Configuración → Exportar Datos. Luego en el otro dispositivo, importa ese archivo desde la misma sección.</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Footer ── -->
      <div class="help-footer">
        <span class="help-footer-text">SystemPos — Sistema POS local</span>
        <q-btn unelevated color="primary" label="Entendido, ¡a vender!" icon="check" v-close-popup />
      </div>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'

const model = ref(false)

function abrir() { model.value = true }

defineExpose({ abrir })
</script>

<style scoped>
.help-card {
  display: flex;
  flex-direction: column;
  background: var(--pc-surface-variant);
  max-width: 960px;
  margin: 0 auto;
}

/* ── Header ── */
.help-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: var(--pc-surface);
  border-bottom: 1px solid var(--pc-border);
  flex-shrink: 0;
  gap: 4px;
}

.help-header-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.help-title {
  font-size: var(--pc-text-lg);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-primary);
  line-height: 1.2;
}

.help-sub {
  font-size: var(--pc-text-sm);
  color: var(--pc-text-hint);
}

/* ── Body ── */
.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ── Notice ── */
.help-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(79, 70, 229, 0.06);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: var(--pc-radius-sm);
  padding: 12px 16px;
  font-size: var(--pc-text-sm);
  color: var(--pc-text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

/* ── Grid ── */
.help-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* ── Section ── */
.help-section {
  background: var(--pc-surface);
  border: 1px solid var(--pc-border);
  border-radius: var(--pc-radius-md);
  overflow: hidden;
}

.help-section--featured {
  grid-column: 1 / -1;
}

.help-section--full {
  grid-column: 1 / -1;
}

.help-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--pc-border);
  background: var(--pc-surface-variant);
}

.help-section-icon {
  width: 34px; height: 34px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.help-section-title {
  font-size: var(--pc-text-base);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-primary);
}

.help-section-body {
  padding: 14px 16px;
  font-size: var(--pc-text-sm);
  color: var(--pc-text-muted);
  line-height: 1.6;
}

.help-section-body p { margin: 0 0 8px; }

.help-section-body ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.help-section-body li { color: var(--pc-text-body); }

/* ── Steps ── */
.help-steps {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.help-step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.help-step-num {
  width: 28px; height: 28px;
  background: var(--q-primary);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
  flex-shrink: 0;
  margin-top: 1px;
}

.help-step-label {
  font-size: var(--pc-text-base);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-primary);
  margin-bottom: 3px;
}

.help-step-desc {
  font-size: var(--pc-text-sm);
  color: var(--pc-text-muted);
  line-height: 1.5;
}

/* ── Tips ── */
.help-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(217, 119, 6, 0.06);
  border: 1px solid rgba(217, 119, 6, 0.2);
  border-radius: 6px;
  padding: 8px 10px;
  margin-top: 10px;
  font-size: var(--pc-text-xs);
  color: var(--pc-text-muted);
  line-height: 1.5;
}

.help-tip--danger {
  background: rgba(220, 38, 38, 0.06);
  border-color: rgba(220, 38, 38, 0.2);
}

/* ── FAQ ── */
.help-faq {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-item {
  border-bottom: 1px solid var(--pc-border);
  padding-bottom: 14px;
}

.faq-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.faq-q {
  font-size: var(--pc-text-sm);
  font-weight: var(--pc-weight-bold);
  color: var(--pc-text-primary);
  margin-bottom: 4px;
}

.faq-a {
  font-size: var(--pc-text-sm);
  color: var(--pc-text-muted);
  line-height: 1.5;
}

/* ── Footer ── */
.help-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--pc-surface);
  border-top: 1px solid var(--pc-border);
  flex-shrink: 0;
}

.help-footer-text {
  font-size: var(--pc-text-sm);
  color: var(--pc-text-hint);
}

/* ── Teclado ── */
kbd {
  display: inline-block;
  padding: 1px 6px;
  background: var(--pc-surface-variant);
  border: 1px solid var(--pc-border);
  border-radius: 4px;
  font-size: var(--pc-text-xs);
  font-family: monospace;
  color: var(--pc-text-body);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .help-grid { grid-template-columns: 1fr; }
  .help-section--featured,
  .help-section--full { grid-column: 1; }
  .help-body { padding: 16px; }
  .help-header { padding: 16px; }
}
</style>
