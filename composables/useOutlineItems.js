import { ref } from 'vue'

/**
 * @function normalizeItemChildren
 * @description 모든 아이템의 children 배열이 초기화되고 expanded 속성이 존재하는지 확인하는 헬퍼 함수
 * @param {Array} items - 정규화할 아웃라인 아이템 배열
 * @returns {Array} 정규화된 아웃라인 아이템 배열
 */
export function normalizeItemChildren(items) {
  if (!Array.isArray(items)) { 
    return [];
  }

  // 아이템의 children 배열이 초기화되고 expanded 속성이 존재하는지 확인하는 헬퍼 함수
  return items.map(item => {
    const newItem = { ...item };
    // children 배열이 없거나 배열이 아닌 경우 빈 배열로 초기화
    if (!newItem.children || !Array.isArray(newItem.children)) {
      newItem.children = [];
    }
    // expanded 속성이 정의되지 않은 경우 기본값 true로 설정
    if (typeof newItem.expanded === 'undefined') {
      newItem.expanded = true;
    }
    // 자식 아이템이 있는 경우 재귀적으로 정규화 수행
    if (newItem.children.length > 0) {
      newItem.children = normalizeItemChildren(newItem.children);
    }
    return newItem;
  });
} 