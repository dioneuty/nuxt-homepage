import { ref, nextTick } from 'vue'
import { useToast } from '~/composables/useToast'
import { useModal } from '~/composables/useModal'

// 수동 임시저장 시스템 컴포저블
export function useDraftSave(formType, formData, fields = []) {
  const { showToast } = useToast()
  const { openModal, closeModal } = useModal()
  
  const isDraftLoading = ref(false)
  const draftKey = `draft_${formType}_${process.client ? window.location.pathname : ''}`
  const DRAFT_EXPIRY_DAYS = 7

  const saveDraft = async () => {
    if (!process.client) return

    try {
      isDraftLoading.value = true
      
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

  const loadDraft = () => {
    if (!process.client) return null

    try {
      const savedDraft = localStorage.getItem(draftKey)
      if (!savedDraft) return null

      const draftData = JSON.parse(savedDraft)
      
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

  const initializeWithDraft = () => {
    const draft = loadDraft()
    if (draft) {
      showDraftRestoreModal(draft)
    }
  }

  const showDraftRestoreModal = (draftData) => {
    const draftDate = new Date(JSON.parse(localStorage.getItem(draftKey)).timestamp)
    openModal(
      '저장된 초안 발견', 
      `${draftDate.toLocaleString()}에 저장된 초안이 있습니다. 불러오시겠습니까?`,
      () => restoreDraft(draftData),
      () => clearDraft()
    )
  }

  const restoreDraft = (draftData) => {
    Object.keys(draftData).forEach(key => {
      if (formData.value.hasOwnProperty(key)) {
        formData.value[key] = draftData[key]
      }
    })
    showToast('임시저장된 내용을 불러왔습니다.', 'success', 3000)
    closeModal()
  }

  const clearDraft = () => {
    if (process.client) {
      localStorage.removeItem(draftKey)
    }
    closeModal()
  }

  return {
    saveDraft,
    loadDraft, 
    initializeWithDraft,
    clearDraft,
    isDraftLoading
  }
} 