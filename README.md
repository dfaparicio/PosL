# ProCuentas — Sistema Local de Control de Caja y Ventas

Mini POS moderno para tienda pequeña. Funciona **sin internet, sin backend obligatorio, sin base de datos**. Toda la data se guarda localmente (LocalStorage + Pinia persist) y el backend (Express) está preparado para MongoDB, JWT y sincronización futura.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Vue 3 (Composition API, `<script setup>`) + Quasar Framework |
| Estado | Pinia (Setup Store + persist automático) |
| Router | Vue Router (lazy loading) |
| HTTP | Axios (instancia centralizada con interceptores) |
| Gráficas | Chart.js + vue-chartjs |
| Estilos | Quasar + SCSS variables |
| Backend | Node.js + Express (ES Modules) |
| Validación | express-validator |
| Autenticación (futura) | JWT + bcryptjs (estructura lista) |

---

## Estructura de carpetas

```
ProCuentasL/
├── README.md
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js              # Entry point Express (puerto 3000)
│       ├── controllers/          # Lógica de negocio
│       │   ├── cajaController.js
│       │   ├── ventasController.js
│       │   └── historialController.js
│       ├── routes/               # Definición de endpoints
│       │   ├── cajaRoutes.js
│       │   ├── ventasRoutes.js
│       │   └── historialRoutes.js
│       ├── middlewares/          # validateFields, webToken, authRoles
│       ├── validations/          # express-validator chains
│       │   ├── cajaValidations.js
│       │   └── ventasValidations.js
│       └── services/            # Estado en memoria (sin DB)
│           ├── cajaService.js
│           ├── ventasService.js
│           └── historialService.js
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js               # Entry point Vue + Quasar + Pinia + Router
        ├── App.vue
        ├── common/
        │   ├── axios.js          # Instancia Axios con interceptores JWT-ready
        │   └── format.js         # formatCurrency, formatDate, formatTime
        ├── services/             # Wrappers API (get, post, put, del)
        │   ├── api.js
        │   ├── cajaService.js
        │   ├── ventasService.js
        │   └── historialService.js
        ├── store/                # Pinia stores (todas con persist: true)
        │   ├── cajaStore.js
        │   ├── ventasStore.js
        │   ├── historialStore.js
        │   └── configuracionStore.js
        ├── router/index.js       # 5 rutas con lazy loading
        ├── layouts/
        │   └── MainLayout.vue    # Sidebar + Header + Page container
        ├── views/                # 5 páginas principales
        │   ├── DashboardPage.vue
        │   ├── VentasPage.vue
        │   ├── CajaPage.vue
        │   ├── HistorialPage.vue
        │   └── ConfiguracionPage.vue
        ├── components/
        │   ├── Dashboard/        # SummaryCards, LastSalesTable, CashTimeline, DailyStats
        │   ├── Ventas/           # SalesTable, NewSaleModal, ProductQuickButtons
        │   ├── Caja/             # OpenCashModal, CashMovementModal, CashHistoryTable, CloseCashModal
        │   ├── Historial/        # HistoryFilters, HistoryTable, DailyHistoryCard
        │   └── Shared/           # AppHeader, AppSidebar, EmptyState, ConfirmDialog
        ├── composables/          # useCaja, useVentas, usePersistencia, useHistorial, useFormatCurrency
        ├── constants/index.js    # Enums + colores
        └── styles/               # quasar.scss + global.css
```

---

## Instalación y ejecución

### Backend

```bash
cd backend
npm install
npm run dev        # nodemon en puerto 3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Vite en puerto 5173 (proxy /api → backend:3000)
```

---

## Vistas principales

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | Dashboard | Resumen rápido: 6 cards, últimas 15 ventas, timeline, gráficas |
| `/ventas` | Ventas | Tabla completa de ventas + modal nueva venta + botones rápidos |
| `/caja` | Caja | Estado caja, apertura/cierre, movimientos (ingresos/retiros) |
| `/historial` | Historial | Historial completo con filtros por fecha/método/producto |
| `/configuracion` | Configuración | Ajustes + exportar/importar datos + backup |

---

## Lógica de negocio

### Fórmula caja
```
Caja Actual = Caja Inicial + Ventas Efectivo + Ingresos - Retiros
```
- Transferencias y tarjetas **NO** afectan caja física

### Fórmula venta
```
Total = (Precio × Cantidad) - Descuento
```
- Si descuento > 20% → advertencia
- Cada venta descuenta stock automáticamente
- Stock ≤ 2 → alerta visual

### Apertura de caja
- Al detectar nuevo día → modal automático
- Muestra caja anterior, permite ingresar nuevo valor
- Calcula diferencia y guarda observación

### Cierre de caja
- Solicita dinero real contado
- `Diferencia = Caja Real - Caja Esperada`

---

## Colores por método de pago

| Método | Color |
|---|---|
| Efectivo | Verde suave |
| Transferencia | Azul suave |
| Tarjeta | Morado suave |

---

## Persistencia

- **Frontend**: Pinia + `pinia-plugin-persistedstate` (LocalStorage automático)
- **Backend**: Estado en memoria (services/)
- **Exportación**: PDF (html2pdf.js) y JSON (backup local)
- Arquitectura preparada para IndexedDB

---

## Funciones futuras (arquitectura lista)

- JWT + login + roles (ADMIN / EMPLEADO)
- MongoDB (servicios desacoplados)
- Sincronización nube
- PWA
- WhatsApp
- Inventario avanzado
- Backups automáticos

---

## Backend endpoints

### Caja
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/caja/abrir` | Abrir caja |
| POST | `/api/caja/cerrar` | Cerrar caja |
| POST | `/api/caja/movimiento` | Agregar ingreso/retiro |
| GET | `/api/caja/actual` | Estado actual de caja |
| GET | `/api/caja/historial` | Historial de movimientos |

### Ventas
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/ventas` | Crear venta |
| GET | `/api/ventas` | Listar ventas (filtros: fecha, metodoPago, producto) |
| GET | `/api/ventas/:id` | Obtener venta por ID |
| GET | `/api/ventas/recientes` | Últimas 15 ventas |

### Historial
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/historial/diario/:fecha` | Historial de un día específico |
| GET | `/api/historial/completo` | Historial completo con filtros |
| GET | `/api/historial/dashboard` | Datos resumen para dashboard |

---

## Resumen de archivos creados

- **Backend**: 16 archivos (package.json + 15 source files)
- **Frontend**: 44 archivos (config + components + views + stores + composables + services + styles)

Total: **60 archivos** de código fuente, todos funcionales y listos para desarrollo.
