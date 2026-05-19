/* ─── Currency ────────────────────────────────────────────── */
export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/* ─── Date ────────────────────────────────────────────────── */
function toDate(date) {
  if (!date) return null
  if (date instanceof Date) return date
  return new Date(date)
}

// "15/05/2026"
export function formatDate(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

// "15 de mayo de 2026"
export function formatDateLong(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

// "lun. 15 may." — compacto para tablas
export function formatDateShort(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

// "Hoy", "Ayer", "Hace 3 días", o "15/05/2026"
export function formatDateFriendly(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  const today = new Date()
  const diffDays = Math.floor((today.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0)) / 86400000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays > 1 && diffDays <= 6) return `Hace ${diffDays} días`
  return formatDate(date)
}

// "15 may" — para badges y chips
export function formatDateChip(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

// helpers
export function isToday(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
}

export function isYesterday(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
}

/* ─── Time ────────────────────────────────────────────────── */
// "14:35"
export function formatTime(date) {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{2}:\d{2}/.test(date)) {
    return date.slice(0, 5)
  }
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// "2:35 p.m."
export function formatTime12(date) {
  if (!date) return ''
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// "15/05 14:35"
export function formatDateTime(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  return `${formatDate(date)} ${formatTime(date)}`
}

// "15 may · 2:35 p.m."
export function formatDateTimeFriendly(date) {
  const d = toDate(date)
  if (!d || isNaN(d)) return ''
  return `${formatDateChip(date)} · ${formatTime12(date)}`
}

/* ─── ISO helpers ─────────────────────────────────────────── */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

export function getNowISO() {
  return new Date().toISOString()
}

export function parseDateISO(str) {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d) ? null : d
}
