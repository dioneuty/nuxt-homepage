import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { normalizeItemChildren } from './useOutlineItems.js'

/**
 * 새로운 UUID 생성 헬퍼 함수
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 새 항목 객체를 생성하는 헬퍼 함수
 */
function createNewOutlineItem() {
  return {
    id: generateUUID(),
    content: '새 항목',
    children: [],
    expanded: true,
  };
}

/**
 * ID로 아이템 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 찾은 아이템 또는 null
 */
function findItem(items, id) {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findItem(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * ID로 아이템의 부모 배열 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 아이템을 포함하는 배열 또는 null
 */
function findParentList(items, id) {
  for (const item of items) {
    if (item.id === id) {
      return items;
    }
    if (item.children) {
      const found = findParentList(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * ID로 아이템의 부모 아이템 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 부모 아이템 또는 null
 */
function findParent(items, id) {
  for (const item of items) {
    if (item.children) {
      for (const child of item.children) {
        if (child.id === id) {
          return item;
        }
      }
      const found = findParent(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * ID로 아이템까지의 전체 경로 찾기 (재귀)
 * @param items 검색할 아이템 배열
 * @param id 찾을 아이템의 ID
 * @returns 찾은 아이템까지의 경로 배열 또는 null
 */
function findPathToItem(items, id) {
  for (const item of items) {
    if (item.id === id) {
      return [item];
    }
    if (item.children) {
      const foundPath = findPathToItem(item.children, id);
      if (foundPath) {
        return [item, ...foundPath];
      }
    }
  }
  return null;
}

/**
 * 아이템을 트리에서 찾아 제거하고, 제거된 아이템과 그 부모를 반환합니다.
 * @param {Array} items - 검색할 아이템 배열 (현재 레벨).
 * @param {string} id - 제거할 아이템의 ID.
 * @returns {{removedItem: Object, parent: Object | null} | null} 제거된 아이템과 부모 정보, 또는 null.
 */
function findAndRemoveItemFromTree(items, id) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      const removed = items.splice(i, 1);
      return { removedItem: removed[0], parent: null }; // Top-level item removed
    }
    if (items[i].children) {
      const result = findAndRemoveItemFromTree(items[i].children, id);
      if (result) {
        if (result.parent === null) { // Child was removed directly from this item's children
          result.parent = items[i];
        }
        return result;
      }
    }
  }
  return null;
}

/**
 * 아웃라이너 데이터 관리 컴포저블
 * @returns {Object} 아웃라이너 데이터 관리 관련 함수와 상태
 */
export default function useOutlineData() {
  // 데이터
  const rootItems = ref([]) // 루트 아이템 배열
  const zoomPath = ref([]) // 확대 경로 배열
  const treeState = ref({}) // 트리 상태를 저장할 객체
  const selectedItem = ref(null) // 선택된 항목
  const selectedItemContent = ref('') // 선택된 항목의 내용
  const isDetailEditing = ref(false); // 상세 화면 편집 모드 상태
  const showDetailModal = ref(false); // 모바일 상세 모달 가시성
  const draggingItem = ref(null); // 드래그 중인 아이템 및 원래 위치 정보
  const clipboardItem = ref(null); // 클립보드에 복사/잘라내기된 아이템
  const isCutOperation = ref(false); // 잘라내기 작업인지 여부

  // 드래그 중 잠재적인 들여쓰기/내어쓰기 의도를 저장할 ref
  const potentialHierarchyChange = ref({
    type: null, // 'indent' | 'outdent' | null
    targetItemId: null // 들여쓰기/내어쓰기 대상 아이템 ID
  });

  // 검색 관련 상태
  const searchQuery = ref('');
  const searchResults = ref([]);
  const currentSearchIndex = ref(0);

  // 클립보드에 아이템이 있는지 확인
  const isClipboardNotEmpty = computed(() => {
    return !!clipboardItem.value;
  });

  // 현재 표시할 항목들 (확대 상태에 따라 달라짐)
  const currentItems = computed({
    get: () => {
      if (zoomPath.value.length === 0) {
        return rootItems.value
      }
      return zoomPath.value[zoomPath.value.length - 1].children
    },
    set: (newItems) => {
  
      if (zoomPath.value.length === 0) {
        rootItems.value = newItems
      } else {
        zoomPath.value[zoomPath.value.length - 1].children = newItems
      }
      saveAllItems(rootItems.value)
    }
  })

  /**
   * localStorage에서 아웃라이너 데이터 불러오기
   * @returns {Object | null} 아웃라이너 데이터 또는 null
   */
  function loadFromLocalStorage() {
    const storedData = localStorage.getItem('outlineData')
    return storedData ? JSON.parse(storedData) : null
  }

  /**
   * localStorage에 데이터 저장하기
   * @param {Object} data - 저장할 아웃라이너 데이터
   */
  function saveToLocalStorage(data) {
    localStorage.setItem('outlineData', JSON.stringify(data))
  }

  /**
   * DB에서 아웃라이너 데이터 불러오기
   * @returns {Object | null} 아웃라이너 데이터 또는 null
   */
  async function loadFromDB() {
    try {
      const response = await fetch('/api/outline')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error loading data from DB:', error)
      return null
    }
  }

  /**
   * DB에 아웃라이너 데이터 저장하기
   * @param {Object} data - 저장할 아웃라이너 데이터
   */
  async function saveToDB(data) {
    try {
      await fetch('/api/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error('Error saving data to DB:', error)
    }
  }

  /**
   * 모든 아이템 저장 (DB & LocalStorage)
   * @param {Object} items - 저장할 아이템 배열
   */
  async function saveAllItems(items) { 
    try {
      await fetch('/api/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items) 
      });
      saveToLocalStorage(items); 
    } catch (error) {
      console.error('Error saving all items:', error);
    }
  }

  /**
   * 선택된 항목의 내용 업데이트 및 DB 저장
   * @param {string} content - 업데이트할 내용
   */
  async function updateSelectedItemContent(content) {
    if (selectedItem.value) {
      selectedItemContent.value = content;
      await saveItemContentToDB(selectedItem.value.id, content);
    }
  }
  
  /**
   * 선택된 항목의 내용을 DB에 저장
   * @param {string} itemId - 항목 ID
   * @param {string} content - 저장할 내용
   */
  async function saveItemContentToDB(itemId, content) {
    try {
      await fetch(`/api/outline-item/${itemId.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } catch (error) {
      console.error('Error saving item content to DB:', error);
    }
  }

  /**
   * 선택된 항목의 내용을 DB에서 불러오기
   * @param {string} itemId - 항목 ID
   */
  async function fetchSelectedItemContent(itemId) {
    if (!itemId) {
      console.warn('fetchSelectedItemContent called with empty itemId');
      selectedItemContent.value = '';
      return;
    }

    try {
  
      const response = await fetch(`/api/outline-item/${itemId.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        selectedItemContent.value = data.content || '';
  
      } else if (response.status === 404) {
  
        selectedItemContent.value = '';
        await saveItemContentToDB(itemId, '');
      } else {
        console.error('Error fetching content:', response.status, response.statusText);
        selectedItemContent.value = `Error loading content: ${response.status}`;
      }
    } catch (error) {
      console.error('Error fetching item content:', error);
      selectedItemContent.value = 'Error fetching content.';
    }
  }

  /**
   * 항목 선택 핸들러
   * @param {Object} item - 선택된 항목
   */
  function handleItemSelected(item) {
    selectedItem.value = item;
    if (item && item.id) {
      fetchSelectedItemContent(item.id);
    } else {
      selectedItemContent.value = '';
    }
  }

  /**
   * 상세 모달 닫기
   */
  function closeDetail() {
    selectedItem.value = null;
    selectedItemContent.value = ''; // Also clear content when closing
    isDetailEditing.value = false; // Close detail also disables edit mode
    showDetailModal.value = false; // Close mobile modal
  }

  /**
   * 상세 편집 모드 토글
   */
  function toggleEditMode() {
    isDetailEditing.value = !isDetailEditing.value;
  }

  /**
   * 아이템 토글 (확장/축소)
   * @param {Object} item - 토글할 아이템
   */
  function toggleItem(item) {
    item.expanded = !item.expanded; 
    saveAllItems(rootItems.value); 
  }

  /**
   * 아이템 복사 (재귀적으로 자식도 복사)
   * @param {Object} item - 복사할 아이템
   * @returns 복사된 새 아이템
   */
  function deepCopyItem(item) {
    const newId = generateUUID();
    return {
      ...item,
      id: newId,
      children: item.children ? item.children.map(deepCopyItem) : [],
    };
  }

  /**
   * 클립보드에 아이템을 설정하고, 잘라내기 작업 여부를 지정합니다.
   * @param {Object} item - 복사/잘라내기할 아이템
   */
  function setClipboardItem(item, isCut) {
    if (item) {
      clipboardItem.value = deepCopyItem(item); // 클립보드에 복사본 저장
      isCutOperation.value = isCut;
    }
  }

  /**
   * 아이템 복제
   * @param {string} itemId - 복제할 아이템의 ID
   */
  function duplicateItem(itemId) {
    const itemToDuplicate = findItem(rootItems.value, itemId);
    if (itemToDuplicate) {
      const duplicatedItem = deepCopyItem(itemToDuplicate);
      const parentList = findParentList(rootItems.value, itemId);
      if (parentList) {
        const index = parentList.findIndex(item => item.id === itemId);
        if (index !== -1) {
          parentList.splice(index + 1, 0, duplicatedItem);
          saveAllItems(rootItems.value);
        }
      }
    }
  }

  /**
   * 아이템 잘라내기
   * @param {string} itemId - 잘라낼 아이템의 ID
   */
  function cutItem(itemId) {
    const itemToCut = findItem(rootItems.value, itemId);
    if (itemToCut) {
      setClipboardItem(itemToCut, true);
      deleteItem(itemId); // 원본 삭제
    }
  }

  /**
   * 아이템 복사
   * @param {string} itemId - 복사할 아이템의 ID
   */
  function copyItem(itemId) {
    const itemToCopy = findItem(rootItems.value, itemId);
    if (itemToCopy) {
      setClipboardItem(itemToCopy, false);
    }
  }

  /**
   * 아이템 붙여넣기
   * @param {string} targetItemId - 붙여넣을 아이템의 ID
   */
  async function pasteItem(targetItemId) {
    if (!clipboardItem.value) return;

    const targetItem = findItem(rootItems.value, targetItemId);
    if (targetItem) {
      const itemToPaste = deepCopyItem(clipboardItem.value); // 새로운 ID로 복사
      targetItem.children.push(itemToPaste);
      targetItem.expanded = true; // 붙여넣으면 부모 노드 펼치기
      await saveAllItems(rootItems.value); 
      if (isCutOperation.value) {
        clipboardItem.value = null; // 잘라내기였으면 클립보드 비우기
        isCutOperation.value = false;
      }
      // Recursively save content for new items from clipboard
      const saveContentRecursive = async (item) => {
        await saveItemContentToDB(item.id, item.content || '');
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            await saveContentRecursive(child);
          }
        }
      };
      await saveContentRecursive(itemToPaste);
    }
  }

  /**
   * 새 아이템 추가
   * @param parentId 부모 아이템의 ID (최상위면 null)
   */
  async function addItem(parentId = null) {
    const newItem = createNewOutlineItem();

    if (parentId === null) {
      rootItems.value.push(newItem);
    } else {
      const parent = findItem(rootItems.value, parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(newItem);
        parent.expanded = true; // 자식이 추가되면 부모를 펼침
      }
    }
    await saveAllItems(rootItems.value);
    // 새 항목의 내용을 DB에 빈 값으로 초기화
    await saveItemContentToDB(newItem.id, '');
  }

  /**
   * 특정 아이템 위에 새 아이템 추가
   * @param targetItemId 대상 아이템의 ID
   */
  async function addAboveItem(targetItemId) {
    const parentList = findParentList(rootItems.value, targetItemId);
    if (parentList) {
      const index = parentList.findIndex(item => item.id === targetItemId);
      if (index !== -1) {
        const newItem = createNewOutlineItem();
        parentList.splice(index, 0, newItem);
        await saveAllItems(rootItems.value);
        await saveItemContentToDB(newItem.id, '');
      }
    }
  }

  /**
   * 특정 아이템 아래에 새 아이템 추가
   * @param targetItemId 대상 아이템의 ID
   */
  async function addBelowItem(targetItemId) {
    const parentList = findParentList(rootItems.value, targetItemId);
    if (parentList) {
      const index = parentList.findIndex(item => item.id === targetItemId);
      if (index !== -1) {
        const newItem = createNewOutlineItem();
        parentList.splice(index + 1, 0, newItem);
        await saveAllItems(rootItems.value);
        await saveItemContentToDB(newItem.id, '');
      }
    }
  }

  /**
   * 아이템 삭제
   * @param id 삭제할 아이템의 ID
   */
  function deleteItem(id) {
    const result = findAndRemoveItemFromTree(rootItems.value, id);

    if (result) {
      saveAllItems(rootItems.value);
      if (selectedItem.value && selectedItem.value.id === id) {
        selectedItem.value = null; // 삭제된 항목이 선택되어 있으면 선택 해제
        selectedItemContent.value = ''; // Also clear content
      }
    }
  }

  /**
   * 아이템 내용 업데이트
   * @param updatedItem 업데이트할 아이템 객체 ({ id, content })
   * @param isContentOnly 업데이트가 content 필드만 포함하는지 여부. 기본값은 false.
   */
  async function updateItem(updatedItem, isContentOnly = false) {
    const item = findItem(rootItems.value, updatedItem.id);
    if (item) {
      if (isContentOnly) {
        item.content = updatedItem.content;
      } else {
        Object.assign(item, updatedItem);
      }
      await saveAllItems(rootItems.value); 
    }
  }


  /**
   * 아이템 들여쓰기
   * @param id 들여쓰기할 아이템의 ID
   */
  function indentItem(id) {
    const parentList = findParentList(rootItems.value, id);
    if (!parentList) return;

    const index = parentList.findIndex(item => item.id === id);
    if (index > 0) {
      const itemToIndent = parentList.splice(index, 1)[0];
      const newParent = parentList[index - 1];
      if (newParent) {
        if (!newParent.children) {
          newParent.children = [];
        }
        newParent.children.push(itemToIndent);
        newParent.expanded = true; // 들여쓰기 시 부모 노드 펼치기
        saveAllItems(rootItems.value);
      }
    }
  }

  /**
   * 아이템 내어쓰기
   * @param id 내어쓰기할 아이템의 ID
   */
  function outdentItem(id) {
    const result = findAndRemoveItemFromTree(rootItems.value, id);
    if (!result) {
      return; // 아이템을 찾지 못함
    }

    const { removedItem, parent: currentParent } = result;

    if (currentParent) {
      const newParentListResult = findParentList(rootItems.value, currentParent.id);
      if (newParentListResult) {
        const indexInNewParentList = newParentListResult.findIndex(item => item.id === currentParent.id);
        if (indexInNewParentList !== -1) {
          newParentListResult.splice(indexInNewParentList + 1, 0, removedItem);
        }
      } else {
        const parentIndexInRoot = rootItems.value.findIndex(item => item.id === currentParent.id);
        if (parentIndexInRoot !== -1) {
          rootItems.value.splice(parentIndexInRoot + 1, 0, removedItem);
        }
      }
    } else {
      console.warn('Attempted to outdent a top-level item without a parent, which should not happen if removed successfully.');
      rootItems.value.push(removedItem);
    }
    saveAllItems(rootItems.value);
  }

  /**
   * 재정렬 처리 및 들여쓰기/내어쓰기 감지
   * @param evt vuedraggable change 이벤트 객체
   */
  function handleReorder(evt) {

    saveAllItems(rootItems.value);
  }

  /**
   * 특정 아이템으로 확대
   * @param {Object} item - 확대할 아이템
   */
  function zoomToItem(item) {
    const pathToItem = findPathToItem(rootItems.value, item.id);
    if (pathToItem) {
      zoomPath.value = pathToItem;
    }
  }

  /**
   * 특정 인덱스로 확대
   * @param {number} index - 확대할 인덱스
   */
  function zoomTo(index) {
    if (index === -1) {
      zoomPath.value = [];
    } else {
      zoomPath.value = zoomPath.value.slice(0, index + 1);
    }
  }

  /**
   * 확대 취소
   */
  function zoomOut() {
    if (zoomPath.value.length > 0) {
      zoomPath.value.pop();
    }
  }

  /**
   * 드래그 시작 처리
   * @param {Object} evt - vuedraggable change 이벤트 객체
   */
  function handleDragStart(evt) {
    const draggedElementId = evt.item.dataset.itemId;
    const draggedItem = findItem(rootItems.value, draggedElementId);
    const parent = findParent(rootItems.value, draggedElementId);
    
    draggingItem.value = {
      item: draggedItem,
      originalParentId: parent ? parent.id : null,
      originalIndex: evt.oldIndex
    };
  }

  /**
   * 드래그 종료 처리
   * @param {Object} evt - vuedraggable change 이벤트 객체
   */
  function handleDragEnd(evt) {
    if (!draggingItem.value) return;

    draggingItem.value = null;
    saveAllItems(rootItems.value);
  }

  /**
   * 드래그 이동 처리
   * @param {Object} evt - vuedraggable change 이벤트 객체
   * @param {number} currentDepth - 현재 드래그 깊이
   */
  function checkDragMove(evt, currentDepth) {
    return true;
  }

  /**
   * 상세 모달 표시
   * @param {Object} item - 상세 모달을 표시할 아이템
   */
  function handleShowDetail(item) {
    selectedItem.value = item;
    showDetailModal.value = true;
  }

  /**
   * 아이템 선택
   * @param {Object} item - 선택할 아이템
   */
  function selectItem(item) {
    selectedItem.value = item;
    if (item) {
      fetchSelectedItemContent(item.id);
    }
  }

  /**
   * 아웃라이너 데이터 초기화
   */
  async function initializeOutlineData() {
    try {
      const dbData = await loadFromDB();

      if (dbData && dbData.length > 0) {
        rootItems.value = normalizeItemChildren(dbData);
        saveToLocalStorage(dbData);
      } else {
        const storedData = loadFromLocalStorage();

        if (storedData && storedData.length > 0) {
          rootItems.value = normalizeItemChildren(storedData);
        } else {
          const sampleData = [
            {
              id: generateUUID(),
              content: '최상위 항목 1',
              children: [
                {
                  id: generateUUID(),
                  content: '하위 항목 1-1',
                  children: [],
                  expanded: true,
                },
                {
                  id: generateUUID(),
                  content: '하위 항목 1-2',
                  children: [],
                  expanded: true,
                },
              ],
            },
            {
              id: generateUUID(),
              content: '최상위 항목 2',
              children: [
                {
                  id: generateUUID(),
                  content: '하위 항목 2-1',
                  children: [],
                  expanded: true,
                },
                {
                  id: generateUUID(),
                  content: '하위 항목 2-2',
                  children: [],
                  expanded: true,
                },
              ],
            },
          ];
          rootItems.value = normalizeItemChildren(sampleData);
          saveToLocalStorage(sampleData); 
        }
      }
    } catch (error) {
      console.error('Error initializing outline data:', error);
      rootItems.value = [];
    }
  }

  /**
   * 아웃라이너 데이터 정리
   */
  async function cleanupOutlineData() {
    await saveToDB(rootItems.value);
    localStorage.removeItem('outlineData'); 
  }

  /**
   * 모든 아이템을 재귀적으로 검색하여 결과 배열 반환
   * @param {Array} items - 검색할 아이템 배열
   * @param {string} query - 검색 쿼리
   * @param {Array} path - 현재 아이템까지의 경로
   * @returns {Array} 검색 결과 배열
   */
  function searchItems(items, query, path = []) {
    let results = [];
    const lowerQuery = query.toLowerCase();

    for (const item of items) {
      const currentPath = [...path, item];
      
      // 아이템 내용에서 검색
      if (item.content.toLowerCase().includes(lowerQuery)) {
        results.push({
          item: item,
          path: currentPath,
          matchType: 'content'
        });
      }

      // 자식들도 재귀적으로 검색
      if (item.children && item.children.length > 0) {
        const childResults = searchItems(item.children, query, currentPath);
        results = results.concat(childResults);
      }
    }

    return results;
  }

  /**
   * 검색 실행
   * @param {string} query - 검색 쿼리
   */
  function performSearch(query) {
    if (!query || query.trim() === '') {
      searchResults.value = [];
      currentSearchIndex.value = 0;
      return;
    }

    searchResults.value = searchItems(rootItems.value, query.trim());
    currentSearchIndex.value = 0;

    // 첫 번째 검색 결과가 있으면 해당 항목으로 이동
    if (searchResults.value.length > 0) {
      navigateToSearchResult(0);
    }
  }

  /**
   * 특정 검색 결과로 이동
   * @param {number} index - 이동할 검색 결과 인덱스
   */
  function navigateToSearchResult(index) {
    if (searchResults.value.length === 0) return;

    const result = searchResults.value[index];
    if (!result) return;

    // 검색 결과 항목까지의 경로를 모두 확장
    const pathToExpand = result.path.slice(0, -1); // 마지막 항목 제외
    pathToExpand.forEach(item => {
      item.expanded = true;
    });

    // 해당 항목 선택
    selectItem(result.item);
    
    // 줌 경로 설정 (선택사항)
    const parentPath = result.path.slice(0, -1);
    if (parentPath.length > 0) {
      // 부모가 있는 경우, 부모까지의 경로를 줌 패스로 설정할 수 있음
      // 하지만 여기서는 단순히 해당 항목을 선택만 함
    }
  }

  /**
   * 검색 결과 네비게이션 (이전/다음)
   * @param {number} direction - 방향 (-1: 이전, 1: 다음)
   */
  function navigateSearchResults(direction) {
    if (searchResults.value.length === 0) return;

    let newIndex = currentSearchIndex.value + direction;
    
    // 순환 처리
    if (newIndex < 0) {
      newIndex = searchResults.value.length - 1;
    } else if (newIndex >= searchResults.value.length) {
      newIndex = 0;
    }

    currentSearchIndex.value = newIndex;
    navigateToSearchResult(newIndex);
  }

  /**
   * 검색 초기화
   */
  function clearSearch() {
    searchQuery.value = '';
    searchResults.value = [];
    currentSearchIndex.value = 0;
  }

  /**
   * 아웃라이너 데이터 관찰자 설정
   */
  function setupOutlineWatchers() {
    watch(selectedItem, async (newItem) => {
      selectedItemContent.value = ''; 

      if (newItem) {
        await fetchSelectedItemContent(newItem.id);
      } else {
        selectedItemContent.value = '';
      }
    }, { deep: true });

    watch(rootItems, (newValue) => {
      saveToLocalStorage(newValue);
    }, { deep: true });

    // 검색 쿼리 변경 감지
    watch(searchQuery, (newQuery) => {
      performSearch(newQuery);
    });
  }


  return {
    // 1. 아웃라이너 데이터 관리 관련 상태
    rootItems, // 루트 아이템 배열
    zoomPath, // 확대 경로 배열
    treeState, // 트리 상태를 저장할 객체
    selectedItem, // 선택된 항목
    selectedItemContent, // 선택된 항목의 내용
    isDetailEditing, // 상세 화면 편집 모드 상태
    showDetailModal, // 모바일 상세 모달 가시성
    draggingItem, // 드래그 중인 아이템 및 원래 위치 정보
    clipboardItem, // 클립보드에 복사/잘라내기된 아이템
    isCutOperation, // 잘라내기 작업인지 여부
    potentialHierarchyChange, // 드래그 중 잠재적인 들여쓰기/내어쓰기 의도를 저장할 ref
    isClipboardNotEmpty, // 클립보드가 비어있지 않은지 여부
    currentItems, // 현재 아이템 배열
    searchQuery, // 검색 쿼리
    searchResults, // 검색 결과
    currentSearchIndex, // 현재 검색 결과 인덱스

    // 2. 아웃라이너 데이터 관리 관련 함수
    generateUUID, // 새로운 UUID 생성 헬퍼 함수
    createNewOutlineItem, // 새 항목 객체를 생성하는 헬
    findItem, // ID로 아이템 찾기 (재귀)
    findParentList, // ID로 아이템의 부모 배열 찾기 (재귀)
    findParent, // ID로 아이템의 부모 아이템 찾기 (재귀)
    findPathToItem, // ID로 아이템까지의 전체 경로 찾기 (재귀)
    findAndRemoveItemFromTree, // 아이템을 트리에서 찾아 제거하고, 제거된 아이템과 그 부모를 반환합니다.
    loadFromLocalStorage, // localStorage에서 아웃라이너 데이터 불러오기
    saveToLocalStorage, // localStorage에 데이터 저장하기
    loadFromDB, // DB에서 아웃라이너 데이터 불러오기
    saveToDB, // DB에 아웃라이너 데이터 저장하기
    saveAllItems, // 모든 아이템 저장 (DB & LocalStorage)
    updateSelectedItemContent, // 선택된 항목의 내용 업데이트 및 DB 저장
    saveItemContentToDB, // 선택된 항목의 내용을 DB에 저장
    fetchSelectedItemContent, // 선택된 항목의 내용을 DB에서 불러오기
    handleItemSelected, // 항목 선택 핸들러
    closeDetail, // 상세 모달 닫기
    toggleEditMode, // 상세 편집 모드 토글
    toggleItem, // 아이템 토글 (확장/축소)
    deepCopyItem, // 아이템 복사 (재귀적으로 자식도 복사)
    setClipboardItem, // 클립보드에 아이템을 설정하고, 잘라내기 작업 여부를 지정합니다.
    duplicateItem, // 아이템 복제
    cutItem, // 아이템 잘라내기
    copyItem, // 아이템 복사
    pasteItem, // 아이템 붙여넣기
    addItem, // 아이템 추가
    addAboveItem, // 아이템 위에 추가
    addBelowItem, // 아이템 아래에 추가
    deleteItem, // 아이템 삭제
    updateItem, // 아이템 내용 업데이트
    indentItem, // 아이템 들여쓰기
    outdentItem, // 아이템 내어쓰기
    handleReorder, // 재정렬 처리 및 들여쓰기/내어쓰기 감지
    zoomToItem, // 특정 아이템으로 확대
    zoomTo, // 특정 인덱스로 확대
    zoomOut, // 확대 취소
    handleDragStart, // 드래그 시작 처리
    handleDragEnd, // 드래그 종료 처리
    checkDragMove, // 드래그 이동 처리
    handleShowDetail, // 상세 모달 표시
    selectItem, // 아이템 선택
    initializeOutlineData, // 아웃라이너 데이터 초기화
    cleanupOutlineData, // 아웃라이너 데이터 정리
    setupOutlineWatchers, // 아웃라이너 데이터 관찰자 설정
    searchItems, // 검색 실행 함수
    performSearch, // 검색 실행
    navigateToSearchResult, // 특정 검색 결과로 이동
    navigateSearchResults, // 검색 결과 네비게이션
    clearSearch, // 검색 초기화
  }
} 