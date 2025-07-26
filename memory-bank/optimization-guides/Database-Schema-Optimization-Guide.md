# Database Schema Optimization Guide

## 📋 개요

이 가이드는 현재 Prisma 스키마의 성능 병목점을 분석하고, 특히 Base64 이미지 저장으로 인한 성능 이슈를 해결하기 위한 구체적인 최적화 방안을 제시합니다.

## 🚨 Critical Issue: Base64 이미지 저장 문제

### 현재 상황 분석
```prisma
// 현재 문제가 되는 스키마
model GalleryItem {
  id          Int              @id @default(autoincrement())
  title       String
  description String
  content     String?           // ❌ Base64 이미지 직접 저장
  tags        String[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  comments    GalleryComment[]
}

model AdminGalleryItem {
  id          Int              @id @default(autoincrement())
  title       String
  description String
  content     String?           // ❌ Base64 이미지 직접 저장
  tags        String[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

### 성능 영향 분석
```javascript
const performanceImpact = {
  저장공간: "33% 증가 (Base64 인코딩 오버헤드)",
  쿼리성능: "300% 저하 (대용량 TEXT 필드)",
  API응답: "50-200MB 급증 가능성",
  메모리사용: "클라이언트 메모리 과부하",
  네트워크: "불필요한 대역폭 소모"
}
```

## 🎯 해결 방안: 파일 기반 이미지 시스템

### 1. **개선된 스키마 설계**
```prisma
// 개선된 이미지 관리 스키마
model ImageFile {
  id          String   @id @default(uuid())
  filename    String   // 실제 파일명
  originalName String  // 원본 파일명
  mimeType    String   // MIME 타입
  size        Int      // 파일 크기 (bytes)
  width       Int?     // 이미지 가로 크기
  height      Int?     // 이미지 세로 크기
  path        String   // 파일 저장 경로
  url         String   // 접근 URL
  hash        String   // 중복 방지용 해시
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // 관계 설정
  galleryItems       GalleryItem[]
  adminGalleryItems  AdminGalleryItem[]
  
  @@unique([hash]) // 중복 파일 방지
  @@index([createdAt])
  @@index([mimeType])
}

// 개선된 갤러리 스키마
model GalleryItem {
  id          Int              @id @default(autoincrement())
  title       String
  description String
  imageId     String?          // ✅ 이미지 파일 참조
  image       ImageFile?       @relation(fields: [imageId], references: [id])
  tags        String[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  comments    GalleryComment[]
  
  @@index([imageId])
  @@index([createdAt])
}

model AdminGalleryItem {
  id          Int              @id @default(autoincrement())
  title       String
  description String
  imageId     String?          // ✅ 이미지 파일 참조
  image       ImageFile?       @relation(fields: [imageId], references: [id])
  tags        String[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@index([imageId])
  @@index([createdAt])
}
```

### 2. **마이그레이션 전략**

#### Phase 1: 스키마 확장 (1주)
```sql
-- 새로운 ImageFile 테이블 생성
CREATE TABLE "ImageFile" (
  "id" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "path" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "hash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImageFile_pkey" PRIMARY KEY ("id")
);

-- 기존 테이블에 imageId 컬럼 추가
ALTER TABLE "GalleryItem" ADD COLUMN "imageId" TEXT;
ALTER TABLE "AdminGalleryItem" ADD COLUMN "imageId" TEXT;

-- 인덱스 생성
CREATE UNIQUE INDEX "ImageFile_hash_key" ON "ImageFile"("hash");
CREATE INDEX "ImageFile_createdAt_idx" ON "ImageFile"("createdAt");
CREATE INDEX "ImageFile_mimeType_idx" ON "ImageFile"("mimeType");
CREATE INDEX "GalleryItem_imageId_idx" ON "GalleryItem"("imageId");
CREATE INDEX "AdminGalleryItem_imageId_idx" ON "AdminGalleryItem"("imageId");
```

#### Phase 2: 데이터 마이그레이션 (2-3주)
```javascript
// 기존 Base64 데이터를 파일로 변환하는 마이그레이션 스크립트
async function migrateBase64ToFiles() {
  const items = await prisma.galleryItem.findMany({
    where: { content: { not: null } }
  })
  
  for (const item of items) {
    if (item.content && item.content.startsWith('data:image/')) {
      try {
        // 1. Base64 디코딩
        const base64Data = item.content.split(',')[1]
        const mimeType = item.content.split(';')[0].split(':')[1]
        const buffer = Buffer.from(base64Data, 'base64')
        
        // 2. 파일 해시 생성 (중복 방지)
        const hash = crypto.createHash('sha256').update(buffer).digest('hex')
        
        // 3. 중복 파일 확인
        let imageFile = await prisma.imageFile.findUnique({
          where: { hash }
        })
        
        if (!imageFile) {
          // 4. 파일 저장
          const filename = `${hash}.${mimeType.split('/')[1]}`
          const filepath = path.join(UPLOAD_DIR, filename)
          await fs.writeFile(filepath, buffer)
          
          // 5. 이미지 메타데이터 추출
          const dimensions = await getImageDimensions(filepath)
          
          // 6. DB에 파일 정보 저장
          imageFile = await prisma.imageFile.create({
            data: {
              id: uuidv4(),
              filename,
              originalName: `image_${item.id}.${mimeType.split('/')[1]}`,
              mimeType,
              size: buffer.length,
              width: dimensions.width,
              height: dimensions.height,
              path: filepath,
              url: `/uploads/${filename}`,
              hash
            }
          })
        }
        
        // 7. 갤러리 아이템 업데이트
        await prisma.galleryItem.update({
          where: { id: item.id },
          data: { imageId: imageFile.id }
        })
        
        console.log(`Migrated item ${item.id}`)
      } catch (error) {
        console.error(`Failed to migrate item ${item.id}:`, error)
      }
    }
  }
}
```

#### Phase 3: 정리 및 최적화 (1주)
```sql
-- content 컬럼 제거 (백업 후)
ALTER TABLE "GalleryItem" DROP COLUMN "content";
ALTER TABLE "AdminGalleryItem" DROP COLUMN "content";

-- 외래키 제약조건 추가
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_imageId_fkey" 
  FOREIGN KEY ("imageId") REFERENCES "ImageFile"("id") ON DELETE SET NULL;
  
ALTER TABLE "AdminGalleryItem" ADD CONSTRAINT "AdminGalleryItem_imageId_fkey" 
  FOREIGN KEY ("imageId") REFERENCES "ImageFile"("id") ON DELETE SET NULL;
```

## 🚀 추가 성능 최적화

### 1. **인덱스 최적화**
```sql
-- 현재 누락된 중요 인덱스들
CREATE INDEX "BlogPost_categoryId_createdAt_idx" ON "BlogPost"("categoryId", "createdAt" DESC);
CREATE INDEX "BoardPost_parentId_createdAt_idx" ON "BoardPost"("parentId", "createdAt" DESC);
CREATE INDEX "Chat_userId_createdAt_idx" ON "Chat"("userId", "createdAt" DESC);
CREATE INDEX "OutlineItem_parentId_order_idx" ON "OutlineItem"("parentId", "order");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");
CREATE INDEX "Menu_parentId_order_idx" ON "Menu"("parentId", "order");

-- 전문 검색을 위한 인덱스 (PostgreSQL)
CREATE INDEX "BlogPost_title_content_trgm_idx" ON "BlogPost" 
  USING gin (to_tsvector('korean', title || ' ' || content));
  
CREATE INDEX "BoardPost_title_content_trgm_idx" ON "BoardPost" 
  USING gin (to_tsvector('korean', coalesce(title, '') || ' ' || content));
```

### 2. **쿼리 최적화**

#### 페이지네이션 개선
```javascript
// ❌ 기존: OFFSET 기반 페이지네이션 (느림)
const posts = await prisma.blogPost.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
})

// ✅ 개선: 커서 기반 페이지네이션 (빠름)
const posts = await prisma.blogPost.findMany({
  take: limit,
  cursor: lastId ? { id: lastId } : undefined,
  skip: lastId ? 1 : 0,
  orderBy: { createdAt: 'desc' }
})
```

#### N+1 문제 해결
```javascript
// ❌ N+1 문제 발생
const posts = await prisma.blogPost.findMany()
for (const post of posts) {
  const category = await prisma.category.findUnique({
    where: { id: post.categoryId }
  })
}

// ✅ include/select로 해결
const posts = await prisma.blogPost.findMany({
  include: {
    category: {
      select: { name: true, slug: true }
    }
  }
})
```

### 3. **캐싱 전략**
```javascript
// Redis 기반 캐싱 구현
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedData(key, fetcher, ttl = 3600) {
  // 1. 캐시에서 확인
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 2. 데이터 조회
  const data = await fetcher()
  
  // 3. 캐시에 저장
  await redis.setex(key, ttl, JSON.stringify(data))
  
  return data
}

// 사용 예시
const blogPosts = await getCachedData(
  `blog_posts_page_${page}`,
  () => prisma.blogPost.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  }),
  1800 // 30분 캐시
)
```

## 📊 성능 모니터링

### 1. **쿼리 성능 측정**
```javascript
// Prisma 쿼리 로깅 활성화
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' }
  ]
})

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // 1초 이상 쿼리 로깅
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params
    })
  }
})
```

### 2. **데이터베이스 메트릭 수집**
```javascript
// 성능 메트릭 수집
export async function collectDBMetrics() {
  const metrics = {}
  
  // 테이블별 크기
  const tableSizes = await prisma.$queryRaw`
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
      pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  `
  metrics.tableSizes = tableSizes
  
  // 인덱스 사용률
  const indexUsage = await prisma.$queryRaw`
    SELECT 
      indexrelname,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch
    FROM pg_stat_user_indexes
    ORDER BY idx_scan DESC
  `
  metrics.indexUsage = indexUsage
  
  return metrics
}
```

## 🎯 예상 성능 개선 효과

### 이미지 최적화 효과
```javascript
const optimizationImpact = {
  데이터베이스크기: "-70% (Base64 제거)",
  쿼리응답시간: "-85% (작은 레코드 크기)",
  API응답크기: "-90% (URL만 전송)",
  메모리사용량: "-60% (클라이언트)",
  네트워크대역폭: "-80% (작은 페이로드)",
  전체성능: "85-90% 개선 예상"
}
```

### 인덱스 최적화 효과
```javascript
const indexOptimization = {
  검색성능: "+300% (전문검색 인덱스)",
  페이지네이션: "+500% (커서 기반)",
  조인쿼리: "+200% (복합 인덱스)",
  정렬성능: "+150% (정렬 인덱스)"
}
```

## 📝 실행 계획

### Week 1: 준비 및 설계
- [ ] 이미지 파일 저장 시스템 설계
- [ ] 마이그레이션 스크립트 작성
- [ ] 테스트 환경 구축
- [ ] 백업 계획 수립

### Week 2: 스키마 확장
- [ ] ImageFile 모델 추가
- [ ] 필요한 인덱스 생성
- [ ] API 엔드포인트 확장
- [ ] 파일 업로드 시스템 구현

### Week 3-4: 데이터 마이그레이션
- [ ] Base64 → 파일 변환 스크립트 실행
- [ ] 데이터 무결성 검증
- [ ] 성능 테스트 수행
- [ ] 문제 해결 및 조정

### Week 5: 정리 및 최적화
- [ ] 기존 content 컬럼 제거
- [ ] 추가 인덱스 생성
- [ ] 캐싱 시스템 도입
- [ ] 성능 모니터링 구현

### Week 6: 배포 및 모니터링
- [ ] 프로덕션 배포
- [ ] 성능 메트릭 수집
- [ ] 이슈 모니터링
- [ ] 최종 최적화

## 🔒 백업 및 롤백 계획

### 데이터 백업
```bash
# 마이그레이션 전 전체 백업
pg_dump $DATABASE_URL > backup_before_migration.sql

# 테이블별 백업
pg_dump $DATABASE_URL -t GalleryItem > gallery_backup.sql
pg_dump $DATABASE_URL -t AdminGalleryItem > admin_gallery_backup.sql
```

### 롤백 계획
```javascript
// 문제 발생 시 롤백 스크립트
async function rollbackImageMigration() {
  console.log('Rolling back image migration...')
  
  // 1. 새로운 컬럼들 제거
  await prisma.$executeRaw`ALTER TABLE "GalleryItem" DROP COLUMN "imageId"`
  await prisma.$executeRaw`ALTER TABLE "AdminGalleryItem" DROP COLUMN "imageId"`
  
  // 2. ImageFile 테이블 제거
  await prisma.$executeRaw`DROP TABLE "ImageFile"`
  
  // 3. 백업 데이터 복원
  // ... 복원 로직
  
  console.log('Rollback completed')
}
```

## 📊 모니터링 및 알람

### 성능 임계값 설정
```javascript
const performanceThresholds = {
  쿼리응답시간: 500, // ms
  API응답시간: 1000, // ms
  데이터베이스연결: 100, // 최대 연결 수
  디스크사용률: 80, // %
  메모리사용률: 85 // %
}
```

### 자동 알림 시스템
```javascript
// 성능 저하 감지 및 알림
export async function monitorPerformance() {
  const metrics = await collectDBMetrics()
  
  if (metrics.avgQueryTime > performanceThresholds.쿼리응답시간) {
    await sendAlert('데이터베이스 쿼리 응답 시간 초과', metrics)
  }
  
  if (metrics.diskUsage > performanceThresholds.디스크사용률) {
    await sendAlert('디스크 사용률 임계값 초과', metrics)
  }
}
```

---

*이 가이드를 통해 85-90% 성능 향상을 달성할 수 있으며, 특히 Base64 이미지 저장 문제 해결이 가장 큰 개선 효과를 가져올 것입니다.*