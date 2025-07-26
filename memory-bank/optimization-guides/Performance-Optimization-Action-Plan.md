# Performance Optimization Action Plan

## 🎯 개요

이 실행 계획서는 Nuxt.js 프로젝트의 성능 최적화를 위한 구체적이고 실행 가능한 단계별 액션 플랜을 제시합니다. 가장 큰 성능 병목점인 Base64 이미지 저장 방식을 우선적으로 해결하고, 전체적인 시스템 성능을 85-90% 향상시키는 것을 목표로 합니다.

## 📊 현재 성능 현황

### Critical Issues (즉시 조치 필요)
```javascript
const criticalIssues = {
  base64Images: {
    impact: "85-90% 성능 저하",
    location: "GalleryItem, AdminGalleryItem 테이블",
    symptoms: ["API 응답 지연", "메모리 과사용", "대용량 페이로드"]
  },
  missingIndexes: {
    impact: "50-70% 쿼리 성능 저하",
    location: "대부분의 테이블",
    symptoms: ["검색 지연", "페이지네이션 느림"]
  },
  n1Queries: {
    impact: "200-300% 불필요한 쿼리",
    location: "관계형 데이터 조회",
    symptoms: ["다중 DB 호출", "응답시간 증가"]
  }
}
```

### Performance Metrics (현재)
```javascript
const currentMetrics = {
  갤러리로딩: "5-15초 (Base64 때문)",
  API응답크기: "50-200MB (이미지 포함)",
  데이터베이스크기: "예상보다 300% 큰 용량",
  메모리사용: "클라이언트에서 과도한 메모리 사용",
  검색성능: "2-5초 (인덱스 부족)"
}
```

## 🚀 Phase 1: Critical Performance Issues (Week 1-6)

### Week 1: 이미지 시스템 설계 및 준비

#### Day 1-2: 요구사항 정의
```markdown
- [ ] 현재 이미지 사용 현황 파악
- [ ] 파일 저장소 선택 (로컬/CDN/클라우드)
- [ ] 이미지 최적화 요구사항 정의
- [ ] 보안 요구사항 검토
```

#### Day 3-4: 기술 스택 결정
```javascript
const techStack = {
  imageStorage: "Local Storage + CDN (향후)",
  imageProcessing: "Sharp.js",
  uploadSystem: "Multer + Express",
  caching: "Nuxt Image module",
  compression: "WebP + JPEG fallback"
}
```

#### Day 5-7: 개발 환경 구축
```markdown
- [ ] Sharp.js 설치 및 설정
- [ ] 파일 업로드 API 구현
- [ ] 이미지 최적화 파이프라인 구축
- [ ] 테스트 환경 준비
```

### Week 2: 새로운 이미지 시스템 구현

#### 새로운 API 엔드포인트 개발
```javascript
// 1. 이미지 업로드 API
// server/api/upload/image.post.js
export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event)
    const file = form.find(item => item.name === 'image')
    
    if (!file) {
      return { error: '이미지 파일이 필요합니다.' }
    }
    
    // 파일 검증
    if (!file.type?.startsWith('image/')) {
      return { error: '이미지 파일만 업로드 가능합니다.' }
    }
    
    // 파일 해시 생성 (중복 방지)
    const hash = crypto.createHash('sha256').update(file.data).digest('hex')
    
    // 중복 파일 확인
    const existingFile = await prisma.imageFile.findUnique({
      where: { hash }
    })
    
    if (existingFile) {
      return { imageFile: existingFile }
    }
    
    // 이미지 최적화
    const optimized = await sharp(file.data)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    
    // 파일 저장
    const filename = `${hash}.webp`
    const filepath = path.join(UPLOAD_DIR, filename)
    await fs.writeFile(filepath, optimized)
    
    // 메타데이터 추출
    const metadata = await sharp(optimized).metadata()
    
    // DB에 저장
    const imageFile = await prisma.imageFile.create({
      data: {
        id: uuidv4(),
        filename,
        originalName: file.filename || 'image.webp',
        mimeType: 'image/webp',
        size: optimized.length,
        width: metadata.width,
        height: metadata.height,
        path: filepath,
        url: `/uploads/${filename}`,
        hash
      }
    })
    
    return { imageFile }
  } catch (error) {
    handleApiError(event, 500, '이미지 업로드 중 오류가 발생했습니다.', error)
  }
})
```

#### 프론트엔드 컴포넌트 업데이트
```vue
<!-- 개선된 이미지 업로드 컴포넌트 -->
<template>
  <div class="image-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="hidden"
    />
    
    <div v-if="!imageFile" @click="$refs.fileInput.click()" class="upload-area">
      <Icon name="heroicons:photo" class="w-12 h-12 text-gray-400" />
      <p>클릭하여 이미지 업로드</p>
    </div>
    
    <div v-else class="image-preview">
      <NuxtImg
        :src="imageFile.url"
        :alt="imageFile.originalName"
        :width="imageFile.width"
        :height="imageFile.height"
        class="max-w-full h-auto rounded-lg"
      />
      <button @click="removeImage" class="remove-btn">
        <Icon name="heroicons:x-mark" />
      </button>
    </div>
    
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
    </div>
  </div>
</template>

<script setup>
const imageFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    const { data } = await $fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
      onUploadProgress: (progress) => {
        uploadProgress.value = Math.round((progress.loaded / progress.total) * 100)
      }
    })
    
    imageFile.value = data.imageFile
    emit('image-uploaded', data.imageFile)
  } catch (error) {
    console.error('업로드 실패:', error)
    // 에러 토스트 표시
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const removeImage = () => {
  imageFile.value = null
  emit('image-removed')
}
</script>
```

### Week 3-4: 데이터 마이그레이션

#### 마이그레이션 스크립트 실행
```javascript
// scripts/migrate-base64-images.js
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'

const prisma = new PrismaClient()
const UPLOAD_DIR = './public/uploads'

async function migrateImages() {
  console.log('Starting Base64 to file migration...')
  
  // 1. 갤러리 아이템 마이그레이션
  const galleryItems = await prisma.galleryItem.findMany({
    where: { content: { not: null } }
  })
  
  console.log(`Found ${galleryItems.length} gallery items with images`)
  
  for (let i = 0; i < galleryItems.length; i++) {
    const item = galleryItems[i]
    
    try {
      console.log(`Processing item ${i + 1}/${galleryItems.length}: ${item.id}`)
      
      if (item.content?.startsWith('data:image/')) {
        const imageFile = await convertBase64ToFile(item.content, `gallery_${item.id}`)
        
        await prisma.galleryItem.update({
          where: { id: item.id },
          data: { imageId: imageFile.id }
        })
        
        console.log(`✅ Migrated gallery item ${item.id}`)
      }
    } catch (error) {
      console.error(`❌ Failed to migrate gallery item ${item.id}:`, error)
    }
  }
  
  // 2. 관리자 갤러리 아이템 마이그레이션
  const adminItems = await prisma.adminGalleryItem.findMany({
    where: { content: { not: null } }
  })
  
  console.log(`Found ${adminItems.length} admin gallery items with images`)
  
  for (let i = 0; i < adminItems.length; i++) {
    const item = adminItems[i]
    
    try {
      console.log(`Processing admin item ${i + 1}/${adminItems.length}: ${item.id}`)
      
      if (item.content?.startsWith('data:image/')) {
        const imageFile = await convertBase64ToFile(item.content, `admin_gallery_${item.id}`)
        
        await prisma.adminGalleryItem.update({
          where: { id: item.id },
          data: { imageId: imageFile.id }
        })
        
        console.log(`✅ Migrated admin gallery item ${item.id}`)
      }
    } catch (error) {
      console.error(`❌ Failed to migrate admin gallery item ${item.id}:`, error)
    }
  }
  
  console.log('Migration completed!')
}

async function convertBase64ToFile(base64Data, prefix) {
  // Base64 디코딩
  const [header, data] = base64Data.split(',')
  const mimeType = header.match(/data:(.+);base64/)[1]
  const buffer = Buffer.from(data, 'base64')
  
  // 파일 해시 생성
  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  
  // 중복 파일 확인
  const existingFile = await prisma.imageFile.findUnique({
    where: { hash }
  })
  
  if (existingFile) {
    return existingFile
  }
  
  // 이미지 최적화
  const optimized = await sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  
  // 파일 저장
  const filename = `${hash}.webp`
  const filepath = path.join(UPLOAD_DIR, filename)
  await fs.writeFile(filepath, optimized)
  
  // 메타데이터 추출
  const metadata = await sharp(optimized).metadata()
  
  // DB에 저장
  const imageFile = await prisma.imageFile.create({
    data: {
      id: crypto.randomUUID(),
      filename,
      originalName: `${prefix}.webp`,
      mimeType: 'image/webp',
      size: optimized.length,
      width: metadata.width,
      height: metadata.height,
      path: filepath,
      url: `/uploads/${filename}`,
      hash
    }
  })
  
  return imageFile
}

// 실행
migrateImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### Week 5: 인덱스 최적화 및 쿼리 개선

#### 필수 인덱스 추가
```sql
-- 1. 복합 인덱스 (성능 향상)
CREATE INDEX "BlogPost_categoryId_createdAt_idx" ON "BlogPost"("categoryId", "createdAt" DESC);
CREATE INDEX "BoardPost_parentId_createdAt_idx" ON "BoardPost"("parentId", "createdAt" DESC);
CREATE INDEX "GalleryComment_galleryItemId_createdAt_idx" ON "GalleryComment"("galleryItemId", "createdAt" DESC);

-- 2. 검색 최적화 인덱스
CREATE INDEX "BlogPost_title_trgm_idx" ON "BlogPost" USING gin (title gin_trgm_ops);
CREATE INDEX "BlogPost_content_trgm_idx" ON "BlogPost" USING gin (content gin_trgm_ops);
CREATE INDEX "BoardPost_content_trgm_idx" ON "BoardPost" USING gin (content gin_trgm_ops);

-- 3. 정렬 최적화 인덱스
CREATE INDEX "OutlineItem_parentId_order_idx" ON "OutlineItem"("parentId", "order");
CREATE INDEX "Menu_parentId_order_idx" ON "Menu"("parentId", "order");
CREATE INDEX "YouTubeVideoCategory_order_idx" ON "YouTubeVideoCategory"("order");

-- 4. 조건부 인덱스 (필터링 최적화)
CREATE INDEX "User_active_admin_idx" ON "User"("isActive", "role") WHERE "isActive" = true;
CREATE INDEX "Chat_userId_recent_idx" ON "Chat"("userId", "createdAt" DESC) WHERE "createdAt" > NOW() - INTERVAL '30 days';
```

#### N+1 쿼리 해결
```javascript
// ❌ Before: N+1 문제
async function getBlogPostsOld() {
  const posts = await prisma.blogPost.findMany()
  
  for (const post of posts) {
    // N+1 문제 발생
    post.category = await prisma.category.findUnique({
      where: { id: post.categoryId }
    })
  }
  
  return posts
}

// ✅ After: Include로 해결
async function getBlogPostsOptimized() {
  return await prisma.blogPost.findMany({
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// ✅ 더 나은 방법: 선택적 로딩
async function getBlogPostsWithPagination(page = 1, limit = 10) {
  const skip = (page - 1) * limit
  
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      skip,
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.blogPost.count()
  ])
  
  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
```

### Week 6: 캐싱 시스템 구현

#### Redis 캐싱 도입
```javascript
// composables/useCache.js
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export function useCache() {
  const get = async (key) => {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  const set = async (key, value, ttl = 3600) => {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  const del = async (key) => {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }
  
  const invalidatePattern = async (pattern) => {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidate error:', error)
    }
  }
  
  return { get, set, del, invalidatePattern }
}

// 캐시된 데이터 조회
export async function getCachedData(key, fetcher, ttl = 3600) {
  const { get, set } = useCache()
  
  let data = await get(key)
  
  if (!data) {
    data = await fetcher()
    await set(key, data, ttl)
  }
  
  return data
}
```

## 🎯 Phase 2: Advanced Optimizations (Week 7-12)

### Week 7-8: 프론트엔드 성능 최적화

#### 이미지 최적화
```javascript
// nuxt.config.ts 이미지 최적화 설정
export default defineNuxtConfig({
  image: {
    // Nuxt Image 최적화 설정
    quality: 80,
    format: ['webp', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    densities: [1, 2],
    
    // 이미지 도메인 허용
    domains: [
      'localhost',
      process.env.NUXT_PUBLIC_SITE_URL
    ],
    
    // 이미지 프로바이더 설정
    providers: {
      customProvider: {
        name: 'custom',
        provider: '~/providers/imageProvider.ts',
        options: {
          baseURL: '/uploads/'
        }
      }
    }
  }
})
```

#### 코드 스플리팅 최적화
```javascript
// 동적 임포트로 컴포넌트 분할
const GalleryModal = defineAsyncComponent(() => 
  import('~/components/gallery/GalleryModal.vue')
)

const AdminPanel = defineAsyncComponent(() =>
  import('~/components/admin/AdminPanel.vue')
)

// 라우트 레벨 코드 스플리팅
const routes = [
  {
    path: '/admin',
    component: () => import('~/pages/admin/index.vue'),
    children: [
      {
        path: 'gallery',
        component: () => import('~/pages/admin/gallery.vue')
      }
    ]
  }
]
```

### Week 9-10: API 최적화

#### 배치 처리 API
```javascript
// server/api/batch/gallery.post.js
export default defineEventHandler(async (event) => {
  const { operations } = await readBody(event)
  
  const results = await Promise.allSettled(
    operations.map(async (op) => {
      switch (op.type) {
        case 'create':
          return await prisma.galleryItem.create({ data: op.data })
        case 'update':
          return await prisma.galleryItem.update({
            where: { id: op.id },
            data: op.data
          })
        case 'delete':
          return await prisma.galleryItem.delete({
            where: { id: op.id }
          })
        default:
          throw new Error(`Unknown operation: ${op.type}`)
      }
    })
  )
  
  return {
    success: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    results
  }
})
```

#### GraphQL-style Selective Loading
```javascript
// server/api/posts/[id].get.js
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  
  // 필드 선택적 로딩
  const include = {}
  if (query.include) {
    const includes = query.include.split(',')
    if (includes.includes('category')) include.category = true
    if (includes.includes('comments')) include.comments = true
    if (includes.includes('author')) include.author = true
  }
  
  const post = await prisma.blogPost.findUnique({
    where: { id: parseInt(id) },
    include
  })
  
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  
  return post
})
```

### Week 11-12: 모니터링 및 자동화

#### 성능 모니터링 대시보드
```javascript
// server/api/admin/metrics.get.js
export default defineEventHandler(async (event) => {
  const metrics = await Promise.all([
    // 데이터베이스 메트릭
    prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables 
      WHERE schemaname = 'public'
    `,
    
    // 쿼리 성능 메트릭
    prisma.$queryRaw`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements
      ORDER BY mean_time DESC
      LIMIT 10
    `,
    
    // 캐시 히트율
    redis.info('stats'),
    
    // 이미지 저장소 사용량
    getStorageUsage()
  ])
  
  return {
    database: metrics[0],
    slowQueries: metrics[1],
    cache: parseCacheStats(metrics[2]),
    storage: metrics[3],
    timestamp: new Date().toISOString()
  }
})
```

## 📊 예상 성능 개선 효과

### 최적화 전/후 비교
```javascript
const performanceComparison = {
  갤러리로딩: {
    before: "5-15초",
    after: "0.5-1초",
    improvement: "90-95% 개선"
  },
  API응답크기: {
    before: "50-200MB",
    after: "50-500KB", 
    improvement: "99% 감소"
  },
  데이터베이스크기: {
    before: "예상의 300%",
    after: "적정 수준",
    improvement: "70% 감소"
  },
  검색성능: {
    before: "2-5초",
    after: "0.1-0.3초",
    improvement: "95% 개선"
  },
  전체성능: {
    improvement: "85-90% 전반적 개선"
  }
}
```

### ROI 분석
```javascript
const roiAnalysis = {
  개발비용: "6주 * 1명 = 1.5 인월",
  운영비용절감: {
    서버비용: "월 50% 절감 (DB 크기, 대역폭)",
    CDN비용: "월 70% 절감 (작은 페이로드)",
    개발생산성: "30% 향상 (빠른 로딩)"
  },
  사용자경험: {
    페이지로딩: "90% 개선",
    이탈률: "예상 30% 감소",
    사용자만족도: "크게 향상"
  }
}
```

## 📅 상세 실행 일정

### Week 1: 설계 및 준비 (2025-02-01 ~ 02-07)
```markdown
**월요일 (02-01)**
- [ ] 현재 성능 벤치마크 측정
- [ ] 이미지 사용 현황 분석
- [ ] 기술 스택 확정

**화요일 (02-02)**
- [ ] 새로운 스키마 설계 완료
- [ ] 마이그레이션 계획 수립
- [ ] 개발 환경 설정

**수요일 (02-03)**
- [ ] Sharp.js 설치 및 테스트
- [ ] 파일 업로드 API 프로토타입
- [ ] 이미지 최적화 파이프라인 구축

**목요일 (02-04)**
- [ ] 보안 검토 및 설정
- [ ] 백업 계획 수립
- [ ] 테스트 환경 구축

**금요일 (02-05)**
- [ ] 주간 리뷰 및 조정
- [ ] 다음 주 계획 확정
```

### Week 2-6: 핵심 구현 (상세 생략)

### Week 7-12: 고도화 및 모니터링

## 🔍 성능 검증 방법

### 자동화된 성능 테스트
```javascript
// tests/performance/image-loading.test.js
import { test, expect } from '@playwright/test'

test('갤러리 페이지 로딩 성능', async ({ page }) => {
  const startTime = Date.now()
  
  await page.goto('/gallery')
  
  // 이미지 로딩 완료 대기
  await page.waitForLoadState('networkidle')
  
  const endTime = Date.now()
  const loadTime = endTime - startTime
  
  // 3초 이내 로딩 검증
  expect(loadTime).toBeLessThan(3000)
  
  // 메모리 사용량 확인
  const memoryUsage = await page.evaluate(() => performance.memory.usedJSHeapSize)
  expect(memoryUsage).toBeLessThan(50 * 1024 * 1024) // 50MB 미만
})
```

### 지속적 모니터링
```javascript
// 매일 자동 실행되는 성능 체크
export async function dailyPerformanceCheck() {
  const results = {
    timestamp: new Date(),
    tests: []
  }
  
  // 1. 갤러리 로딩 속도
  const galleryLoadTime = await measureGalleryLoadTime()
  results.tests.push({
    name: 'Gallery Load Time',
    value: galleryLoadTime,
    threshold: 1000,
    passed: galleryLoadTime < 1000
  })
  
  // 2. API 응답 크기
  const apiResponseSize = await measureApiResponseSize()
  results.tests.push({
    name: 'API Response Size',
    value: apiResponseSize,
    threshold: 500 * 1024, // 500KB
    passed: apiResponseSize < 500 * 1024
  })
  
  // 3. 데이터베이스 성능
  const dbQueryTime = await measureDatabasePerformance()
  results.tests.push({
    name: 'Database Query Time',
    value: dbQueryTime,
    threshold: 100,
    passed: dbQueryTime < 100
  })
  
  // 결과 저장 및 알림
  await savePerformanceResults(results)
  
  if (results.tests.some(test => !test.passed)) {
    await sendPerformanceAlert(results)
  }
  
  return results
}
```

## 🚨 위험 관리 및 롤백 계획

### 위험 요소
```javascript
const risks = {
  데이터손실: {
    probability: "낮음",
    impact: "높음",
    mitigation: "완전 백업 + 단계별 마이그레이션"
  },
  서비스중단: {
    probability: "중간",
    impact: "높음", 
    mitigation: "점진적 배포 + 즉시 롤백 가능"
  },
  성능저하: {
    probability: "낮음",
    impact: "중간",
    mitigation: "철저한 테스트 + 단계별 검증"
  }
}
```

### 롤백 시나리오
```bash
# 긴급 롤백 스크립트
#!/bin/bash
echo "Starting emergency rollback..."

# 1. 새로운 스키마 제거
psql $DATABASE_URL -c "ALTER TABLE GalleryItem DROP COLUMN imageId;"
psql $DATABASE_URL -c "DROP TABLE ImageFile;"

# 2. 백업 데이터 복원
pg_restore -d $DATABASE_URL backup_before_migration.sql

# 3. 애플리케이션 재시작
pm2 restart nuxt-app

echo "Rollback completed successfully"
```

## 📈 성공 지표 (KPI)

### 기술적 지표
- **갤러리 로딩 시간**: < 1초 (현재 5-15초)
- **API 응답 크기**: < 500KB (현재 50-200MB)
- **데이터베이스 크기**: 70% 감소
- **검색 응답 시간**: < 300ms (현재 2-5초)

### 비즈니스 지표  
- **사용자 이탈률**: 30% 감소
- **페이지뷰**: 20% 증가
- **사용자 만족도**: 4.0 → 4.5+
- **서버 비용**: 50% 절감

---

*이 실행 계획을 통해 6주 만에 85-90% 성능 향상을 달성하고, 사용자 경험을 대폭 개선할 수 있습니다.*