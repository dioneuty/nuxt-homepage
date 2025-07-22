import { promises as fs } from 'fs';
import path from 'path';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);

    const backupDir = path.join(process.cwd(), 'public', 'backups');

    let files = [];
    try {
      files = await fs.readdir(backupDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // 디렉토리가 없으면 빈 배열 반환
        return { success: true, files: [] };
      }
      throw err; // 다른 파일 시스템 오류
    }

    const sqlFiles = files.filter(file => file.endsWith('.sql'));

    return { success: true, files: sqlFiles };

  } catch (error) {
    return handleApiError(event, error.statusCode || 500, 'Failed to retrieve backup file list.', error);
  }
}); 