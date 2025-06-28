import { ref, nextTick } from 'vue'
import { useToast } from '~/composables/useToast'
import { useModal } from '~/composables/useModal'

/**
 * 수동 임시저장 버튼 시스템을 위한 컴포저블 함수
 * 사용자가 명시적으로 임시저장 버튼을 클릭할 때만 폼 데이터를 저장하고 복원
 * @param {string} formType - 폼 타입 (blog, board, wiki 등)
 * @param {Ref} formData - 폼 데이터 반응형 객체
 * @param {Array} fields - 저장할 필드 목록 (name, required 속성)
 * @returns {Object} 임시저장 관련 함수와 상태
 */
export function useDraftSave(formType, formData, fields = []) {
  const { showToast } = useToast()
  const { openModal, closeModal } = useModal()
  
  const isDraftLoading = ref(false)
  const draftKey = `draft_${formType}_${process.client ? window.location.pathname : ''}`
  const DRAFT_EXPIRY_DAYS = 7

  /**
   * 현재 폼 데이터를 localStorage에 임시저장
   */
  const saveDraft = async () => {
    if (!process.client) return

    try {
      isDraftLoading.value = true
      
      // 폼 데이터 검증 - 필수 필드는 제외하고 내용이 있는 필드만 저장
      const dataToSave = {}
      let hasContent = false
      
      fields.forEach(field => {
        const fieldValue = formData.value[field.name]
        if (fieldValue && fieldValue.toString().trim() !== '') {
          dataToSave[field.name] = fieldValue
          hasContent = true
        }
      })
      
      if (!hasContent) {
        showToast('저장할 내용이 없습니다.', 'warning', 3000)
        return
      }

      const draftData = {
        data: dataToSave,
        timestamp: Date.now(),
        expires: Date.now() + (DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      }

      localStorage.setItem(draftKey, JSON.stringify(draftData))
      showToast('임시저장이 완료되었습니다.', 'success', 3000)
      
    } catch (error) {
      console.error('임시저장 중 오류 발생:', error)
      showToast('임시저장에 실패했습니다.', 'error', 3000)
    } finally {
      isDraftLoading.value = false
    }
  }

  /**
   * localStorage에서 초안 데이터 불러오기
   */
  const loadDraft = () => {
    if (!process.client) return null

    try {
      const savedDraft = localStorage.getItem(draftKey)
      if (!savedDraft) return null

      const draftData = JSON.parse(savedDraft)
      
      // 만료 확인
      if (Date.now() > draftData.expires) {
        localStorage.removeItem(draftKey)
        return null
      }

      return draftData.data
    } catch (error) {
      console.error('초안 불러오기 중 오류 발생:', error)
      localStorage.removeItem(draftKey)
      return null
    }
  }

  /**
   * 초안 데이터를 폼에 복원
   */
  const restoreDraft = (draftData) => {
    if (!draftData) return

    // 폼 데이터 객체가 비어있다면 초기화
    if (!formData.value || Object.keys(formData.value).length === 0) {
      fields.forEach(field => {
        if (!formData.value[field.name]) {
          formData.value[field.name] = ''
        }
      })
    }

    Object.keys(draftData).forEach(key => {
      if (formData.value.hasOwnProperty(key)) {
        formData.value[key] = draftData[key]
      }
    })

    showToast('초안이 복원되었습니다.', 'success', 3000)
  }

  /**
   * 초안 삭제
   */
  const deleteDraft = () => {
    if (!process.client) return

    try {
      localStorage.removeItem(draftKey)
    } catch (error) {
      console.error('초안 삭제 중 오류 발생:', error)
    }
  }

  /**
   * 초안 존재 여부 확인
   */
  const hasDraft = () => {
    if (!process.client) return false

    const draftData = loadDraft()
    return draftData !== null
  }

  /**
   * 초안 복구 프롬프트 표시 (2개 선택지: 복원, 삭제)
   */
  const showDraftRestorePrompt = () => {
    if (!hasDraft()) return

    // 커스텀 2버튼 모달 HTML 생성
    const modalHtml = `
      <div class="text-center">
        <p class="mb-6 text-gray-700 dark:text-gray-300">이전에 작성하던 내용을 어떻게 하시겠습니까?</p>
        <div class="flex justify-center space-x-4">
          <button id="restore-btn" class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            복원하기
          </button>
          <button id="delete-btn" class="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            삭제하기
          </button>
        </div>
      </div>
    `

    openModal(
      '임시저장된 초안이 있습니다',
      modalHtml,
      null, // 콜백 없음 (직접 이벤트 리스너 사용)
      false // confirm 모달 아님
    )

    // DOM이 렌더링된 후 이벤트 리스너 추가
    nextTick(() => {
      const restoreBtn = document.getElementById('restore-btn')
      const deleteBtn = document.getElementById('delete-btn')

      if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
          const draftData = loadDraft()
          if (draftData) {
            restoreDraft(draftData)
          }
          closeModal()
        })
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          deleteDraft()
          showToast('초안이 삭제되었습니다.', 'info', 3000)
          closeModal()
        })
      }
    })
  }

  /**
   * 폼 제출 완료 시 초안 자동 삭제
   */
  const onFormSubmitSuccess = () => {
    deleteDraft()
  }

  /**
   * 만료된 초안들 정리 (전체 정리)
   */
  const cleanupExpiredDrafts = () => {
    if (!process.client) return

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('draft_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data.expires && Date.now() > data.expires) {
              localStorage.removeItem(key)
            }
          } catch (error) {
            // 파싱 오류 시 해당 키 삭제
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error('만료된 초안 정리 중 오류 발생:', error)
    }
  }

  return {
    // 상태
    isDraftLoading,
    
    // 함수
    saveDraft,
    loadDraft,
    restoreDraft,
    deleteDraft,
    hasDraft,
    showDraftRestorePrompt,
    onFormSubmitSuccess,
    cleanupExpiredDrafts
  }
} 