import { createRouter, createWebHistory } from 'vue-router'
import { useCajaStore } from '@/store/cajaStore'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    meta: { title: 'Dashboard', icon: 'dashboard' }
  },
  {
    path: '/ventas',
    name: 'Ventas',
    component: () => import('@/views/VentasPage.vue'),
    meta: { title: 'Ventas', icon: 'point_of_sale', requiresCaja: true }
  },
  {
    path: '/caja',
    name: 'Caja',
    component: () => import('@/views/CajaPage.vue'),
    meta: { title: 'Caja', icon: 'account_balance' }
  },
  {
    path: '/historial',
    name: 'Historial',
    component: () => import('@/views/HistorialPage.vue'),
    meta: { title: 'Historial', icon: 'history' }
  },
  {
    path: '/estadisticas',
    name: 'Estadisticas',
    component: () => import('@/views/EstadisticasPage.vue'),
    meta: { title: 'Estadísticas', icon: 'bar_chart' }
  },
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: () => import('@/views/ConfiguracionPage.vue'),
    meta: { title: 'Configuración', icon: 'settings' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (!to.meta.requiresCaja) return next()

  const cajaStore = useCajaStore()
  if (!cajaStore.cajaAbierta) {
    import('quasar').then(({ Notify }) => {
      Notify.create({
        message: 'Debes abrir la caja para registrar ventas',
        color: 'warning',
        icon: 'lock',
        position: 'top',
        timeout: 3000
      })
    })
    return next('/caja')
  }

  next()
})

export default router
