import { useModal } from '~/composables/useModal'

/**
 * 삭제 확인 모달 및 삭제 로직을 처리하는 컴포저블입니다.
 * @param {Function} deleteApiCall - 실제 삭제 API를 호출하는 비동기 함수.
 * @param {Function} onSuccess - 삭제 성공 시 실행될 콜백 함수.
 * @param {Function} onError - 삭제 실패 시 실행될 콜백 함수.
 */
export function useConfirmDelete(deleteApiCall, onSuccess, onError) {
  const { openModal } = useModal()

  /**
   * 사용자에게 삭제 확인 모달을 띄우고, 확인 시 `deleteApiCall`을 실행합니다.
   */
  async function confirmAndDelete() {
    openModal('확인', '정말로 삭제하시겠습니까?', async (confirmed) => {
      if (confirmed) {
        try {
          await deleteApiCall()
          onSuccess()
        } catch (error) {
          console.error('삭제 중 오류 발생:', error)
          onError(error)
        }
      }
    }, true)
  }

  return { confirmAndDelete }
} 