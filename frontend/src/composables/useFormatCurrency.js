import { formatCurrency, formatDate, formatTime, formatDateTime } from '@/common/format'

export function useFormatCurrency() {
  return {
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime
  }
}
