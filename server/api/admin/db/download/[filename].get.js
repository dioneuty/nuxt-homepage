import { promises as fs } from 'fs';
import path from 'path';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);

    const filename = event.context.params?.filename;
    if (!filename) {
      throw createError({ statusCode: 400, message: 'File name is missing.' });
    }

    const filePath = path.join(process.cwd(), 'public', 'backups', filename);

    // 파일이 존재하는지 확인
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw createError({ statusCode: 404, message: 'File not found.' });
      }
      throw err; // 다른 파일 시스템 오류
    }

    // 파일이 디렉토리가 아닌지 확인
    if (!stats.isFile()) {
      throw createError({ statusCode: 400, message: 'Requested path is not a file.' });
    }

    // 헤더 설정
    setHeaders(event, {
      'Content-Type': 'application/sql',
      'Content-Disposition': `attachment; filename="${filename}" `,
      'Content-Length': stats.size,
    });

    // 파일을 스트림으로 읽어 반환 (대용량 파일 처리 용이)
    return fs.readFile(filePath);

  } catch (error) {
    return handleApiError(event, error.statusCode || 500, 'Failed to download backup file.', error);
  }
}); 