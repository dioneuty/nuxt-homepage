import prisma from '~/server/utils/prisma'
import * as jose from 'jose'

export default defineEventHandler(async (event) => {
  // 인증 확인
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '인증이 필요합니다.'
    })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    if (payload.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '관리자 권한이 필요합니다.'
      })
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: '유효하지 않은 토큰입니다.'
    })
  }

  // 쿼리 파라미터 파싱
  const query = getQuery(event)
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10
  const search = query.search || ''
  const role = query.role || ''
  const status = query.status || ''
  const sortBy = query.sortBy || 'createdAt'
  const sortOrder = query.sortOrder || 'desc'
  
  const skip = (page - 1) * limit

  // 검색 조건
  const where = {}
  
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  if (role) {
    where.role = role
  }
  
  if (status) {
    where.isActive = status === 'active'
  }

  // 정렬 조건
  const orderBy = {}
  orderBy[sortBy] = sortOrder

  try {
    // 사용자 목록 조회
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // 전체 사용자 수 조회
    const totalUsers = await prisma.user.count({ where })
    const totalPages = Math.ceil(totalUsers / limit)

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
    console.error('사용자 목록 조회 오류:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '사용자 목록을 불러오는 중 오류가 발생했습니다.'
    })
  }
}) 