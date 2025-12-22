import { computed } from 'vue'
import type { TableEvents } from '../types'

const eventMap = {
  onSelectionChange: 'selection-change',
  onRowClick: 'row-click',
  onCellClick: 'cell-click',
  onSortChange: 'sort-change',
  onFilterChange: 'filter-change',
} as const

export function useTableEvents(events?: TableEvents) {
  const tableEvents = computed(() => {
    const result: Record<string, any> = {}
    Object.entries(eventMap).forEach(([key, eventName]) => {
      if (events?.[key as keyof TableEvents]) {
        result[eventName] = events[key as keyof TableEvents]
      }
    })
    return result
  })

  return { tableEvents }
}
