import { ref } from 'vue'

// 아웃라인 아이템 정규화 함수
export function normalizeItemChildren(items) {
  return (items || []).map(item => ({
    ...item,
    children: normalizeItemChildren(item.children),
    expanded: item.expanded ?? true
  }))
} 