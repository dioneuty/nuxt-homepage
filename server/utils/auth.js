import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { getCookie, createError } from 'h3';

const prisma = new PrismaClient();

// JWT 시크릿 필수 환경변수 검증
if (!process.env.JWT_SECRET) {
  throw new Error('🔐 JWT_SECRET 환경 변수가 설정되지 않았습니다. 보안을 위해 필수적으로 설정해야 합니다.');
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('🔐 JWT_SECRET은 보안을 위해 최소 32자 이상이어야 합니다.');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyAuthToken(event) {
  const token = getCookie(event, 'auth_token');

  if (!token) {
    throw createError({
      statusCode: 401,
      message: '인증 토큰이 없습니다.',
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '유효하지 않은 사용자입니다.',
      });
    }

    // 사용자 정보를 event.context에 추가하여 다음 미들웨어 또는 핸들러에서 사용할 수 있도록 합니다.
    event.context.user = user;

    // 관리자 역할 확인은 API 핸들러에서 직접 수행합니다.
    // if (user.role !== 'ADMIN') {
    //   throw createError({ statusCode: 403, message: '접근 권한이 없습니다.' });
    // }

  } catch (error) {
    console.error('Error verifying auth token:', error);
    throw createError({
      statusCode: 401,
      message: '유효하지 않거나 만료된 토큰입니다.',
    });
  }
} 