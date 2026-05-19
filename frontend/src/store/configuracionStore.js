import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConfiguracionStore = defineStore('configuracion', () => {
  const negocioNombre = ref('Mi Negocio')
  const moneda = ref('COP')
  const alertaStockBajo = ref(true)
  const stockBajoLimite = ref(3)
  const porcentajeMaxDescuento = ref(20)

  const productosRapidos = ref([
    { nombre: 'Agua 500ml', precio: 2000, stock: 50 },
    { nombre: 'Gaseosa 350ml', precio: 3500, stock: 30 },
    { nombre: 'Papas Fritas', precio: 2500, stock: 20 },
    { nombre: 'Chocolatina', precio: 1500, stock: 40 },
    { nombre: 'Café', precio: 3000, stock: 100 },
    { nombre: 'Tinto', precio: 1500, stock: 80 },
    { nombre: 'Empanada', precio: 2500, stock: 25 },
    { nombre: 'Pastel', precio: 3000, stock: 15 }
  ])

  return {
    negocioNombre,
    moneda,
    alertaStockBajo,
    stockBajoLimite,
    porcentajeMaxDescuento,
    productosRapidos
  }
}, {
  persist: true
})
