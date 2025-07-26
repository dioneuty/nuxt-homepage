import { ref } from 'vue'

/**
 * 이미지 압축 및 최적화 composable
 * Base64 이미지 크기 최적화와 품질 조절
 */
export function useImageOptimizer() {
  const isCompressing = ref(false)
  const compressionStats = ref({
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0
  })

  /**
   * Base64 이미지 압축
   * @param {string} base64Data - 원본 Base64 이미지 데이터
   * @param {object} options - 압축 옵션
   * @returns {Promise<string>} 압축된 Base64 이미지 데이터
   */
  const compressBase64Image = async (base64Data, options = {}) => {
    if (!base64Data || !process.client) return base64Data
    
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      format = 'jpeg'
    } = options

    isCompressing.value = true
    
    try {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // 원본 크기 계산
          const originalSize = base64Data.length
          
          // 비율 유지하면서 리사이즈
          let { width, height } = calculateOptimalSize(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          )

          canvas.width = width
          canvas.height = height

          // 고품질 렌더링 설정
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height)

          // 압축된 이미지 생성
          const compressedData = canvas.toDataURL(`image/${format}`, quality)
          const compressedSize = compressedData.length

          // 통계 업데이트
          compressionStats.value = {
            originalSize,
            compressedSize,
            compressionRatio: ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
          }

          resolve(compressedData)
        }
        img.src = base64Data
      })
    } catch (error) {
      console.error('이미지 압축 실패:', error)
      return base64Data
    } finally {
      isCompressing.value = false
    }
  }

  /**
   * 최적 크기 계산 (비율 유지)
   * @param {number} originalWidth - 원본 너비
   * @param {number} originalHeight - 원본 높이
   * @param {number} maxWidth - 최대 너비
   * @param {number} maxHeight - 최대 높이
   * @returns {object} 최적화된 크기
   */
  const calculateOptimalSize = (originalWidth, originalHeight, maxWidth, maxHeight) => {
    let width = originalWidth
    let height = originalHeight

    // 너비가 최대값을 초과하는 경우
    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    // 높이가 최대값을 초과하는 경우
    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    }
  }

  /**
   * 이미지 품질 분석
   * @param {string} base64Data - Base64 이미지 데이터
   * @returns {object} 이미지 메타데이터
   */
  const analyzeImage = async (base64Data) => {
    if (!base64Data || !process.client) return null

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const size = base64Data.length
        const sizeKB = (size / 1024).toFixed(1)
        const sizeMB = (size / (1024 * 1024)).toFixed(2)

        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          fileSize: size,
          fileSizeKB: sizeKB,
          fileSizeMB: sizeMB,
          format: base64Data.split(';')[0].split('/')[1] || 'unknown'
        })
      }
      img.src = base64Data
    })
  }

  /**
   * 적응형 압축 (이미지 크기에 따라 자동 조절)
   * @param {string} base64Data - Base64 이미지 데이터
   * @returns {Promise<string>} 최적화된 Base64 이미지 데이터
   */
  const adaptiveCompress = async (base64Data) => {
    const analysis = await analyzeImage(base64Data)
    if (!analysis) return base64Data

    let options = {}

    // 이미지 크기에 따른 적응형 설정
    if (analysis.fileSizeMB > 2) {
      // 2MB 이상: 강력한 압축
      options = {
        maxWidth: 600,
        maxHeight: 450,
        quality: 0.7,
        format: 'jpeg'
      }
    } else if (analysis.fileSizeMB > 1) {
      // 1-2MB: 중간 압축
      options = {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.75,
        format: 'jpeg'
      }
    } else if (analysis.fileSizeMB > 0.5) {
      // 0.5-1MB: 가벼운 압축
      options = {
        maxWidth: 1000,
        maxHeight: 750,
        quality: 0.8,
        format: 'jpeg'
      }
    } else {
      // 0.5MB 이하: 최소 압축
      options = {
        maxWidth: 1200,
        maxHeight: 900,
        quality: 0.85,
        format: 'jpeg'
      }
    }

    return await compressBase64Image(base64Data, options)
  }

  /**
   * 썸네일 생성
   * @param {string} base64Data - Base64 이미지 데이터
   * @param {number} size - 썸네일 크기 (기본값: 150px)
   * @returns {Promise<string>} 썸네일 Base64 데이터
   */
  const generateThumbnail = async (base64Data, size = 150) => {
    return await compressBase64Image(base64Data, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    })
  }

  /**
   * 배치 압축 (여러 이미지 동시 처리)
   * @param {Array} imageDataArray - Base64 이미지 배열
   * @param {object} options - 압축 옵션
   * @returns {Promise<Array>} 압축된 이미지 배열
   */
  const batchCompress = async (imageDataArray, options = {}) => {
    const {
      concurrency = 3, // 동시 처리 수
      ...compressOptions
    } = options

    const results = []
    
    for (let i = 0; i < imageDataArray.length; i += concurrency) {
      const batch = imageDataArray.slice(i, i + concurrency)
      
      const batchPromises = batch.map(async (imageData, index) => {
        const compressed = await compressBase64Image(imageData, compressOptions)
        return { 
          index: i + index, 
          original: imageData, 
          compressed 
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }
    
    return results.sort((a, b) => a.index - b.index)
  }

  /**
   * 압축 통계 초기화
   */
  const resetStats = () => {
    compressionStats.value = {
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0
    }
  }

  /**
   * 파일 크기를 읽기 쉬운 형태로 변환
   * @param {number} bytes - 바이트 크기
   * @returns {string} 형식화된 크기 문자열
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    // 상태
    isCompressing,
    compressionStats,
    
    // 압축 메서드
    compressBase64Image,
    adaptiveCompress,
    generateThumbnail,
    batchCompress,
    
    // 분석 메서드
    analyzeImage,
    calculateOptimalSize,
    
    // 유틸리티
    resetStats,
    formatFileSize
  }
}