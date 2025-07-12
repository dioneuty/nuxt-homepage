/**
 * 아웃라이너 유틸리티 헬퍼 함수들
 * useOutlineData.js에서 분리된 공통 헬퍼 함수들
 */

/**
 * UUID 생성
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 새 아웃라인 아이템 생성
 */
export function createNewOutlineItem(content = '새 항목') {
  return {
    id: generateUUID(),
    content,
    children: [],
    expanded: true,
  };
}

/**
 * 트리 검색 유틸리티
 */
export class TreeSearchUtils {
  /**
   * ID로 아이템 찾기 (재귀)
   */
  static findItem(items, id) {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * ID로 아이템의 부모 배열 찾기
   */
  static findParentList(items, id) {
    for (const item of items) {
      if (item.id === id) return items;
      if (item.children) {
        const found = this.findParentList(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * ID로 아이템의 부모 아이템 찾기
   */
  static findParent(items, id) {
    for (const item of items) {
      if (item.children?.some(child => child.id === id)) return item;
      if (item.children) {
        const found = this.findParent(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * ID로 아이템까지의 경로 찾기
   */
  static findPathToItem(items, id) {
    for (const item of items) {
      if (item.id === id) return [item];
      if (item.children) {
        const foundPath = this.findPathToItem(item.children, id);
        if (foundPath) return [item, ...foundPath];
      }
    }
    return null;
  }

  /**
   * 아이템 제거 및 정보 반환
   */
  static findAndRemoveItem(items, id) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        const removed = items.splice(i, 1)[0];
        return { removedItem: removed, parent: null };
      }
      if (items[i].children) {
        const result = this.findAndRemoveItem(items[i].children, id);
        if (result) {
          result.parent = result.parent || items[i];
          return result;
        }
      }
    }
    return null;
  }
}

/**
 * 아이템 복사 유틸리티
 */
export function deepCopyItem(item) {
  return {
    ...item,
    id: generateUUID(),
    children: item.children ? item.children.map(deepCopyItem) : [],
  };
} 