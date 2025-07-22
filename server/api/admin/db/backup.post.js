import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient, Prisma } from '@prisma/client';
import { generateInsertSql } from '~/server/utils/dbBackupUtils';
import { verifyAuthToken } from '~/server/utils/auth';
import { handleApiError } from '~/server/utils/apiErrorHandlers';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 관리자 권한 확인
    await verifyAuthToken(event);

    const backupDir = path.join(process.cwd(), 'public', 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
    const backupFileName = `supabase_backup_${timestamp}.sql`;
    const backupFilePath = path.join(backupDir, backupFileName);

    let sqlStatements = [];
    const models = Prisma.dmmf.datamodel.models;

    for (const model of models) {
      // TRUNCATE TABLE 문 추가 (복구 시 사용)
      sqlStatements.push(`TRUNCATE TABLE \"${model.dbName || model.name}\";`);

      const inserts = await generateInsertSql(model.name);
      if (inserts.length > 0) {
        sqlStatements.push(...inserts);
      }
    }

    const backupContent = sqlStatements.join('\n');
    await fs.writeFile(backupFilePath, backupContent);

    return {
      success: true,
      message: `Database backup successful: ${backupFileName}`,
      filePath: `/backups/${backupFileName}`,
    };
  } catch (error) {
    return handleApiError(event, error.statusCode || 500, 'Failed to create database backup.', error);
  }
}); 