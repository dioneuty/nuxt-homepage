import { promises as fs } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * SQL 파일을 읽고 파싱하여 데이터베이스에 복구합니다.
 * TRUNCATE TABLE 문과 INSERT 문을 포함한 SQL 파일을 처리합니다.
 * @param {string} filePath - 복구할 SQL 파일의 전체 경로
 */
export async function restoreDatabase(filePath) {
  const sqlContent = await fs.readFile(filePath, 'utf8');

  // SQL 문 분리 (세미콜론 기준, 단 문자열 내부의 세미콜론은 무시)
  // 간단한 구현을 위해 정규식을 사용하여 세미콜론으로 분리하되,
  // 작은따옴표나 큰따옴표 안에 있는 세미콜론은 무시하도록 합니다.
  // 더 복잡한 SQL 파싱은 별도의 라이브러리가 필요할 수 있습니다.
  const sqlCommands = sqlContent.split(/;\\s*(?=(?:[^']|'[^']*')*[^']*$)/g)
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);

  // 트랜잭션을 사용하여 복구 작업의 원자성 보장
  await prisma.$transaction(async (tx) => {
    for (const command of sqlCommands) {
      // Prisma의 $executeRawUnsafe를 사용하여 SQL 실행
      // SQL 인젝션 위험을 방지하기 위해 사용자가 업로드한 파일에 대한 신뢰가 필요
      await tx.$executeRawUnsafe(command);
    }
  });

  console.log(`Database restored from ${filePath}`);
}

export default prisma; 