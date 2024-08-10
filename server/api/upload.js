import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const files = await readMultipartFormData(event)
    if (!files || files.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    const file = files[0]
    const fileName = `${Date.now()}-${file.filename}`
    const filePath = join(process.cwd(), 'public', 'uploads', fileName)

    await writeFile(filePath, file.data)

    return { 
      success: true, 
      url: `/uploads/${fileName}`
    }
  } catch (error) {
    console.error('파일 업로드 중 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '파일 업로드 실패'
    })
  }
})