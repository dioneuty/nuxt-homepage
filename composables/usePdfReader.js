import { ref, onMounted } from 'vue'

/**
 * PDF 리더의 상태와 동작을 관리하는 컴포저블 함수입니다.
 * PDF.js 라이브러리를 사용하여 PDF 문서 로딩, 페이지 렌더링, 네비게이션 등을 처리합니다.
 * @returns {Object} PDF 리더 관련 속성 및 함수
 * @property {Ref<boolean>} isLoading - PDF 로딩 상태
 * @property {Ref<string|null>} error - 에러 메시지
 * @property {Ref<Object|null>} pdfDocument - 로드된 PDF 문서 객체
 * @property {Ref<number>} currentPage - 현재 페이지 번호
 * @property {Ref<number>} totalPages - 총 페이지 수
 * @property {Ref<number>} zoomLevel - 확대/축소 레벨
 * @property {function(string|ArrayBuffer): Promise<void>} loadPdf - PDF 파일을 로드하는 함수
 * @property {function(HTMLCanvasElement, number): Promise<void>} renderPage - 특정 페이지를 캔버스에 렌더링하는 함수
 * @property {function(number): void} goToPage - 특정 페이지로 이동하는 함수
 * @property {function(): void} nextPage - 다음 페이지로 이동하는 함수
 * @property {function(): void} prevPage - 이전 페이지로 이동하는 함수
 * @property {function(number): void} setZoom - 확대/축소 레벨을 설정하는 함수
 * @property {function(): void} cleanup - 리소스 정리 함수
 */
export function usePdfReader() {
  // 1. PDF 리더 상태 관리
  const isLoading = ref(false)
  const error = ref(null)
  const pdfDocument = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(0)
  const zoomLevel = ref(1.0)
  const isPdfLibLoaded = ref(false)

  /**
   * PDF.js 라이브러리가 로드되었는지 확인하고 Worker를 설정합니다.
   */
  function initializePdfjs() {
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      // Worker 경로 설정 (CDN에서 로드)
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.12.6/build/pdf.worker.min.js'
      isPdfLibLoaded.value = true
      return true
    }
    return false
  }

  /**
   * PDF 파일을 로드합니다.
   * @param {string|ArrayBuffer|Uint8Array} source - PDF 파일 소스 (URL, ArrayBuffer, 또는 Uint8Array)
   * @returns {Promise<void>}
   */
  async function loadPdf(source) {
    if (!isPdfLibLoaded.value) {
      error.value = 'PDF.js 라이브러리가 아직 로드되지 않았습니다.'
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const loadingTask = window.pdfjsLib.getDocument(source)
      pdfDocument.value = await loadingTask.promise
      
      totalPages.value = pdfDocument.value.numPages
      currentPage.value = 1

      console.log('PDF 로드 완료:', {
        totalPages: totalPages.value,
        title: pdfDocument.value._pdfInfo?.info?.Title || 'Unknown'
      })

    } catch (err) {
      error.value = `PDF 로드 실패: ${err.message}`
      console.error('PDF 로드 에러:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 특정 페이지를 캔버스에 렌더링합니다.
   * @param {HTMLCanvasElement} canvas - 렌더링할 캔버스 요소
   * @param {number} pageNum - 렌더링할 페이지 번호 (기본값: 현재 페이지)
   * @returns {Promise<void>}
   */
  async function renderPage(canvas, pageNum = currentPage.value) {
    if (!pdfDocument.value || !canvas) {
      error.value = 'PDF 문서 또는 캔버스가 없습니다.'
      return
    }

    try {
      const page = await pdfDocument.value.getPage(pageNum)
      const context = canvas.getContext('2d')
      
      // 뷰포트 설정 (확대/축소 적용)
      const viewport = page.getViewport({ scale: zoomLevel.value })
      
      // 캔버스 크기 설정
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      // 고해상도 디스플레이 지원
      const pixelRatio = window.devicePixelRatio || 1
      if (pixelRatio > 1) {
        canvas.width = viewport.width * pixelRatio
        canvas.height = viewport.height * pixelRatio
        canvas.style.width = viewport.width + 'px'
        canvas.style.height = viewport.height + 'px'
        context.scale(pixelRatio, pixelRatio)
      }

      // 렌더링 옵션
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      // 페이지 렌더링
      await page.render(renderContext).promise
      
      console.log(`페이지 ${pageNum} 렌더링 완료`)

    } catch (err) {
      error.value = `페이지 렌더링 실패: ${err.message}`
      console.error('페이지 렌더링 에러:', err)
    }
  }

  /**
   * 특정 페이지로 이동합니다.
   * @param {number} pageNum - 이동할 페이지 번호
   */
  function goToPage(pageNum) {
    if (pageNum >= 1 && pageNum <= totalPages.value) {
      currentPage.value = pageNum
    }
  }

  /**
   * 다음 페이지로 이동합니다.
   */
  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  /**
   * 이전 페이지로 이동합니다.
   */
  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  /**
   * 확대/축소 레벨을 설정합니다.
   * @param {number} zoom - 확대/축소 레벨 (1.0이 기본값)
   */
  function setZoom(zoom) {
    if (zoom > 0.1 && zoom <= 3.0) {
      zoomLevel.value = zoom
    }
  }

  /**
   * 리소스를 정리합니다.
   */
  function cleanup() {
    if (pdfDocument.value) {
      pdfDocument.value.destroy()
      pdfDocument.value = null
    }
    currentPage.value = 1
    totalPages.value = 0
    error.value = null
    isLoading.value = false
  }

  // 컴포넌트 마운트 시 PDF.js 라이브러리 초기화
  onMounted(() => {
    // PDF.js 라이브러리가 로드될 때까지 대기
    const checkPdfLib = () => {
      if (initializePdfjs()) {
        console.log('PDF.js 라이브러리 초기화 완료')
      } else {
        // 100ms 후 다시 시도
        setTimeout(checkPdfLib, 100)
      }
    }
    checkPdfLib()
  })

  return {
    // 1. PDF 리더 상태
    isLoading,          // PDF 로딩 상태
    error,              // 에러 메시지
    pdfDocument,        // 로드된 PDF 문서 객체
    currentPage,        // 현재 페이지 번호
    totalPages,         // 총 페이지 수
    zoomLevel,          // 확대/축소 레벨
    isPdfLibLoaded,     // PDF.js 라이브러리 로드 상태

    // 2. PDF 리더 함수
    loadPdf,            // PDF 파일을 로드하는 함수
    renderPage,         // 특정 페이지를 캔버스에 렌더링하는 함수
    goToPage,           // 특정 페이지로 이동하는 함수
    nextPage,           // 다음 페이지로 이동하는 함수
    prevPage,           // 이전 페이지로 이동하는 함수
    setZoom,            // 확대/축소 레벨을 설정하는 함수
    cleanup,            // 리소스 정리 함수
  }
} 