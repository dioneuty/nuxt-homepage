import { writeFile } from 'fs/promises'
import { join } from 'path'

/**
 * @file 파일 업로드 API
 * @description 클라이언트로부터 받은 파일을 서버의 'public/uploads' 디렉토리에 저장합니다.
 *              POST 요청만 허용하며, 업로드된 파일의 URL을 반환합니다.
 */
export default defineEventHandler(async (event) => {
  // POST 메소드만 허용합니다. 다른 메소드 요청 시 405 Method Not Allowed 오류를 반환합니다.
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    // 멀티파트 폼 데이터에서 파일을 읽어옵니다.
    const files = await readMultipartFormData(event)
    
    // 업로드된 파일이 없거나 파일 배열이 비어있는 경우 400 Bad Request 오류를 반환합니다.
    if (!files || files.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    // 첫 번째 업로드된 파일을 처리합니다.
    const file = files[0]
    // 파일 이름은 현재 타임스탬프와 원본 파일 이름을 조합하여 고유하게 생성합니다.
    const fileName = `${Date.now()}-${file.filename}`
    // 파일이 저장될 서버의 절대 경로를 구성합니다. (프로젝트 루트/public/uploads/)
    const filePath = join(process.cwd(), 'public', 'uploads', fileName)

    // 파일을 지정된 경로에 비동기적으로 작성합니다.
    await writeFile(filePath, file.data)

    // 성공 응답과 함께 업로드된 파일의 접근 가능한 URL을 반환합니다.
    return { 
      success: true, 
      url: `/uploads/${fileName}`
    }
  } catch (error) {
    // 파일 업로드 중 오류 발생 시 서버 콘솔에 오류를 로깅하고 500 Internal Server Error를 반환합니다.
    console.error('파일 업로드 중 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '파일 업로드 실패'
    })
  }
})