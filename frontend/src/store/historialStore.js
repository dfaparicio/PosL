import { defineStore } from 'pinia'

// Store reservado para futuras integraciones con backend.
// Actualmente la app opera 100% local; el historial se obtiene
// directamente de ventasStore y cajaStore.
export const useHistorialStore = defineStore('historial', () => {
  return {}
})
