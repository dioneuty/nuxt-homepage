<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        PDF 리더 테스트
      </h1>
      
      <!-- PDF 업로드 섹션 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          PDF 파일 업로드
        </h2>
        
        <input 
          type="file" 
          accept="application/pdf" 
          @change="handleFileUpload"
          class="block w-full text-sm text-gray-500 dark:text-gray-400
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
        />
        
        <!-- 또는 테스트용 샘플 PDF 로드 버튼 -->
        <div class="mt-4">
          <button 
            @click="loadSamplePdf"
            :disabled="isLoading"
            class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 
                   text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            샘플 PDF 로드 (테스트용)
          </button>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="error" class="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">PDF 로딩 중...</p>
      </div>

      <!-- PDF 뷰어 섹션 -->
      <div v-if="pdfDocument && !isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          PDF 뷰어
        </h2>
        
        <!-- 컨트롤 바 -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <!-- 페이지 네비게이션 -->
          <div class="flex items-center gap-2">
            <button 
              @click="prevPage"
              :disabled="currentPage <= 1"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 
                     text-white font-medium py-1 px-3 rounded transition-colors"
            >
              이전
            </button>
            
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ currentPage }} / {{ totalPages }}
            </span>
            
            <button 
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 
                     text-white font-medium py-1 px-3 rounded transition-colors"
            >
              다음
            </button>
          </div>

          <!-- 확대/축소 -->
          <div class="flex items-center gap-2">
            <button 
              @click="setZoom(zoomLevel * 0.8)"
              class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded transition-colors"
            >
              축소
            </button>
            
            <span class="text-sm text-gray-700 dark:text-gray-300 min-w-16 text-center">
              {{ Math.round(zoomLevel * 100) }}%
            </span>
            
            <button 
              @click="setZoom(zoomLevel * 1.25)"
              class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded transition-colors"
            >
              확대
            </button>
          </div>
        </div>

        <!-- PDF 캔버스 -->
        <div class="flex justify-center">
          <canvas 
            ref="pdfCanvas"
            class="border border-gray-300 dark:border-gray-600 shadow-lg max-w-full"
            style="max-height: 70vh;"
          ></canvas>
        </div>
      </div>

      <!-- PDF.js 로딩 상태 -->
      <div v-if="!isPdfLibLoaded" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">PDF.js 라이브러리 로딩 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { usePdfReader } from '~/composables/usePdfReader'

// PDF 리더 컴포저블 사용
const {
  isLoading,
  error,
  pdfDocument,
  currentPage,
  totalPages,
  zoomLevel,
  isPdfLibLoaded,
  loadPdf,
  renderPage,
  goToPage,
  nextPage,
  prevPage,
  setZoom,
  cleanup
} = usePdfReader()

// 템플릿 참조
const pdfCanvas = ref(null)

/**
 * 파일 업로드 핸들러
 * @param {Event} event - 파일 입력 이벤트
 */
async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer()
    await loadPdf(arrayBuffer)
  } else {
    error.value = 'PDF 파일만 업로드할 수 있습니다.'
  }
}

/**
 * 테스트용 샘플 PDF 로드
 */
async function loadSamplePdf() {
  // 간단한 PDF URL 또는 Base64로 인코딩된 PDF 데이터 사용
  // 실제 환경에서는 서버의 샘플 PDF 파일을 사용하거나
  // 간단한 PDF 생성 라이브러리로 동적 생성 가능
  try {
    // 테스트용으로 작은 PDF 파일을 만들어보겠습니다.
    // 실제로는 서버에 샘플 PDF 파일을 두고 사용하는 것이 좋습니다.
    error.value = '샘플 PDF 기능은 실제 PDF 파일이 서버에 있을 때 구현됩니다. 실제 PDF 파일을 업로드해주세요.'
  } catch (err) {
    error.value = '샘플 PDF 로드에 실패했습니다.'
  }
}

// 현재 페이지나 확대/축소 레벨이 변경될 때마다 다시 렌더링
watch([currentPage, zoomLevel], () => {
  if (pdfDocument.value && pdfCanvas.value) {
    renderPage(pdfCanvas.value, currentPage.value)
  }
}, { immediate: false })

// PDF 문서가 로드될 때 첫 페이지 렌더링
watch(pdfDocument, (newDoc) => {
  if (newDoc && pdfCanvas.value) {
    renderPage(pdfCanvas.value, 1)
  }
}, { immediate: false })

// 컴포넌트 언마운트 시 리소스 정리
onUnmounted(() => {
  cleanup()
})
</script> 