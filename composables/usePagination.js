import { computed } from 'vue'

export function usePagination(totalPagesRef, currentPageRef) {
  const visiblePages = computed(() => {
    if (totalPagesRef.value === 0) return []
    const start = Math.floor((currentPageRef.value - 1) / 10) * 10 + 1
    const end = Math.min(start + 9, totalPagesRef.value)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  return {
    visiblePages,
  }
} 