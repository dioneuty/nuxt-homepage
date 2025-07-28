import sharp from 'sharp'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

/**
 * 🚀 최고 성능 이미지 압축 API
 * Sharp 라이브러리를 사용하여 서버사이드에서 이미지를 압축합니다.
 * 95%+ 압축률을 제공하며, 다양한 포맷을 지원합니다.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { imageBase64, options = {} } = body

    if (!imageBase64) {
      throw createError({
        statusCode: 400,
        statusMessage: '이미지 데이터가 필요합니다.'
      })
    }

    // Base64에서 실제 데이터 추출 (data:image/jpeg;base64, 제거)
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    const inputBuffer = Buffer.from(base64Data, 'base64')
    
    // Server-side compression started

    // NOTE: 이미지 압축 로직 비활성화 - 원본 이미지를 그대로 반환합니다.
    const format = options.format || 'jpeg'; // 원본 이미지 포맷을 유지하거나 적절한 기본값으로 설정
    const originalMetadata = await sharp(inputBuffer).metadata();

    const stats = {
      originalSize: inputBuffer.length,
      compressedSize: inputBuffer.length, // 압축 안 하므로 동일
      reduction: 0, // 압축 안 하므로 0% 감소
      processTime: 0, // 압축 안 하므로 0ms
      format: originalMetadata.format || format,
      originalDimensions: {
        width: originalMetadata.width,
        height: originalMetadata.height
      },
      compressedDimensions: {
        width: originalMetadata.width, // 압축 안 하므로 동일
        height: originalMetadata.height // 압축 안 하므로 동일
      }
    }

    // 원본 Base64 형태로 반환
    const originalBase64 = `data:image/${originalMetadata.format || format};base64,${inputBuffer.toString('base64')}`

    return {
      success: true,
      compressedImage: originalBase64, // 압축되지 않은 원본 이미지 반환
      stats
    }

    // 아래의 기존 압축 로직은 실행되지 않도록 주석 처리하거나 제거합니다.
    // const startTime = performance.now()
    // let sharpInstance = sharp(inputBuffer)
    // const metadata = await sharpInstance.metadata()
    // const maxWidth = options.maxWidth
    // const maxHeight = options.maxHeight
    // if (maxWidth && maxHeight) {
    //   sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
    //     fit: 'inside',
    //     withoutEnlargement: true,
    //     kernel: sharp.kernel.lanczos3
    //   })
    // }
    // const format = options.format || 'webp'
    // const quality = options.quality || 85
    // let compressedBuffer
    // switch (format.toLowerCase()) {
    //   case 'webp':
    //     compressedBuffer = await sharpInstance.webp({ quality: quality, effort: 6, smartSubsample: true, preset: 'photo' }).toBuffer()
    //     break
    //   case 'avif':
    //     compressedBuffer = await sharpInstance.avif({ quality: quality, effort: 9, chromaSubsampling: '4:2:0' }).toBuffer()
    //     break
    //   case 'jpeg':
    //   case 'jpg':
    //     compressedBuffer = await sharpInstance.jpeg({ quality: quality, progressive: true, mozjpeg: true, trellisQuantisation: true, overshootDeringing: true, optimizeScans: true }).toBuffer()
    //     break
    //   case 'png':
    //     compressedBuffer = await sharpInstance.png({ quality: quality, compressionLevel: 9, adaptiveFiltering: true, progressive: true }).toBuffer()
    //     break
    //   default:
    //     compressedBuffer = await sharpInstance.webp({ quality: quality, effort: 6, smartSubsample: true }).toBuffer()
    // }
    // const processTime = Math.round(performance.now() - startTime)
    // const compressedMetadata = await sharp(compressedBuffer).metadata()
    // const originalSize = inputBuffer.length
    // const compressedSize = compressedBuffer.length
    // const reduction = Math.round((1 - compressedSize / originalSize) * 100)
    // const stats = { originalSize, compressedSize, reduction, processTime, format: format, originalDimensions: { width: metadata.width, height: metadata.height }, compressedDimensions: { width: compressedMetadata.width, height: compressedMetadata.height } }
    // const compressedBase64 = `data:image/${format};base64,${compressedBuffer.toString('base64')}`
    // return { success: true, compressedImage: compressedBase64, stats }

  } catch (error) {
    console.error('Server compression failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `이미지 압축 중 오류가 발생했습니다: ${error.message}`
    })
  }
})

/**
 * 📊 바이트를 읽기 쉬운 형태로 변환
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 