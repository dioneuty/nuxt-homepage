import { writeFile } from 'fs/promises'
import { join } from 'path'
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 파일 업로드 API
export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    handleApiError(event, 405, 'Method Not Allowed')
  }

  try {
    const files = await readMultipartFormData(event)
    
    if (!files?.length) {
      handleApiError(event, 400, 'No file uploaded')
    }

    const file = files[0]
    const fileName = `${Date.now()}-${file.filename}`
    const filePath = join(process.cwd(), 'public', 'uploads', fileName)

    await writeFile(filePath, file.data)

    return { success: true, url: `/uploads/${fileName}` }
  } catch (error) {
    handleApiError(event, 500, '파일 업로드 실패', error)
  }
})