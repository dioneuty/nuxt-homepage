import prisma from '~/server/utils/prisma'
import * as jose from 'jose'

/**
 * @file 관리자 사용자 목록 조회 API
 * @description 관리자 권한으로 사용자 목록을 조회합니다. 페이지네이션, 검색 (사용자 이름, 이메일),
 *              역할(role) 및 활성화 상태(isActive) 필터링, 정렬 기능을 제공합니다.
 *              이 API는 JWT 토큰을 통한 인증 및 관리자 권한 확인이 필수적입니다.
 */
export default defineEventHandler(async (event) => {
  // 1. 인증 확인: 쿠키에서 JWT 토큰을 가져옵니다.
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '인증이 필요합니다.'
    })
  }

  try {
    // 2. 토큰 검증 및 페이로드 추출: JWT Secret을 사용하여 토큰의 유효성을 검증하고 사용자 정보를 추출합니다.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    // 3. 권한 확인: 추출된 사용자 페이로드에서 역할(role)이 'ADMIN'인지 확인합니다.
    // 관리자가 아닌 경우 403 Forbidden 오류를 반환합니다.
    if (payload.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '관리자 권한이 필요합니다.'
      })
    }
  } catch (error) {
    // 토큰 검증 실패 시 (만료, 변조 등) 401 Unauthorized 오류를 반환합니다.
    console.error('Token verification error in admin users.get.js:', error); // 오류 로깅
    throw createError({
      statusCode: 401,
      statusMessage: '유효하지 않은 토큰입니다.'
    })
  }

  // 4. 쿼리 파라미터 파싱: 페이지네이션, 검색, 필터링, 정렬을 위한 쿼리 파라미터를 파싱합니다.
  const query = getQuery(event)
  const page = parseInt(query.page) || 1 // 현재 페이지 (기본값: 1)
  const limit = parseInt(query.limit) || 10 // 페이지당 항목 수 (기본값: 10)
  const search = query.search || '' // 검색어 (기본값: 빈 문자열)
  const role = query.role || '' // 역할 필터 (기본값: 빈 문자열)
  const status = query.status || '' // 활성화 상태 필터 (기본값: 빈 문자열)
  const sortBy = query.sortBy || 'createdAt' // 정렬 기준 컬럼 (기본값: createdAt)
  const sortOrder = query.sortOrder || 'desc' // 정렬 순서 (기본값: desc)
  
  const skip = (page - 1) * limit // Prisma 쿼리를 위한 skip 값 계산

  // 5. 검색 및 필터링 조건 설정 (where 절)
  const where = {}
  
  if (search) {
    // 검색어가 있는 경우 사용자 이름과 이메일 필드에서 대소문자 구분 없이 검색합니다.
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  if (role) {
    // 역할 필터가 있는 경우 해당 역할의 사용자만 조회합니다.
    where.role = role
  }
  
  if (status) {
    // 상태 필터가 있는 경우 활성화 상태에 따라 필터링합니다.
    where.isActive = status === 'active'
  }

  // 6. 정렬 조건 설정 (orderBy 절)
  const orderBy = {}
  orderBy[sortBy] = sortOrder // 동적으로 정렬 기준과 순서를 설정합니다.

  try {
    // 7. 사용자 목록 조회: 설정된 검색, 필터링, 정렬, 페이지네이션 조건을 적용하여 사용자 목록을 조회합니다.
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: { // 보안을 위해 비밀번호 등 민감한 정보는 제외하고 필요한 필드만 선택합니다.
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 8. 전체 사용자 수 조회 및 페이지네이션 정보 계산
    const totalUsers = await prisma.user.count({ where }) // 필터링 조건에 맞는 전체 사용자 수
    const totalPages = Math.ceil(totalUsers / limit) // 전체 페이지 수 계산

    // 9. 응답 반환: 조회된 사용자 목록과 페이지네이션 정보를 반환합니다.
    return {
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    // 데이터베이스 조회 중 오류 발생 시 로깅하고 500 Internal Server Error를 반환합니다.
    console.error('사용자 목록 조회 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '사용자 목록을 불러오는 중 오류가 발생했습니다.'
    })
  }
}) 