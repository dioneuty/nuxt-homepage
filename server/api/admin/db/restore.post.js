import { promises as fs } from 'fs';
import path from 'path';
import { restoreDatabase } from '~/server/utils/dbRestoreUtils';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);

    const formData = await readMultipartFormData(event);
    const file = formData.find(item => item.name === 'backupFile');

    if (!file) {
      throw createError({
        statusCode: 400,
        message: 'No backup file provided.',
      });
    }

    if (file.type !== 'application/sql' && !file.filename.endsWith('.sql')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file type. Only .sql files are allowed.',
      });
    }

    const tempDir = path.join(process.cwd(), 'temp_uploads');
    await fs.mkdir(tempDir, { recursive: true });

    const tempFilePath = path.join(tempDir, file.filename);
    await fs.writeFile(tempFilePath, file.data);

    try {
      await restoreDatabase(tempFilePath);
      return { success: true, message: 'Database restoration successful.' };
    } finally {
      // 복구 완료 또는 실패 여부와 관계없이 임시 파일 삭제
      await fs.unlink(tempFilePath);
    }
  } catch (error) {
    return handleApiError(event, error.statusCode || 500, 'Failed to restore database.', error);
  }
}); 