-- =====================================================
-- Supabase 인덱스 (올바른 테이블명 사용)
-- =====================================================

-- 1. 갤러리 최적화 (가장 큰 테이블)
CREATE INDEX IF NOT EXISTS idx_galleryitem_created_desc 
ON "GalleryItem"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_galleryitem_tags_gin 
ON "GalleryItem" USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_admingalleryitem_created_desc 
ON "AdminGalleryItem"("createdAt" DESC);

-- 2. 갤러리 댓글 최적화
CREATE INDEX IF NOT EXISTS idx_gallerycomment_item 
ON "GalleryComment"("galleryItemId", "createdAt" ASC);

-- 3. 방명록 최적화 (올바른 테이블명)
CREATE INDEX IF NOT EXISTS idx_guestbooks_created_desc 
ON "guestbooks"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_guestbook_comments_item 
ON "guestbook_comments"("guestbookId", "createdAt" ASC);

-- 4. 블로그 최적화
CREATE INDEX IF NOT EXISTS idx_blogpost_created_desc 
ON "BlogPost"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_blogpost_category_date 
ON "BlogPost"("categoryId", "createdAt" DESC);

-- 5. 게시판 최적화
CREATE INDEX IF NOT EXISTS idx_boardpost_created_desc 
ON "BoardPost"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_boardpost_parent 
ON "BoardPost"("parentId") WHERE "parentId" IS NOT NULL;

-- 6. 관리자 게시판
CREATE INDEX IF NOT EXISTS idx_adminboard_created_desc 
ON "AdminBoard"("createdAt" DESC);

-- 7. QnA 최적화
CREATE INDEX IF NOT EXISTS idx_qna_created_desc 
ON "QnA"("createdAt" DESC);

-- 8. 위키 최적화
CREATE INDEX IF NOT EXISTS idx_wiki_created_desc 
ON "Wiki"("createdAt" DESC);

-- 9. 아웃라이너 최적화
CREATE INDEX IF NOT EXISTS idx_outlineitem_parent 
ON "OutlineItem"("parentId") WHERE "parentId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outlineitem_order 
ON "OutlineItem"("order" ASC);

-- 10. 메뉴 최적화
CREATE INDEX IF NOT EXISTS idx_menu_parent_order 
ON "Menu"("parentId", "order" ASC);

-- 11. 사용자 최적화
CREATE INDEX IF NOT EXISTS idx_user_created_desc 
ON "User"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_user_active 
ON "User"("isActive");

-- 12. 카테고리 최적화
CREATE INDEX IF NOT EXISTS idx_category_slug 
ON "Category"("slug");

-- 13. 채팅 최적화
CREATE INDEX IF NOT EXISTS idx_chat_user_created 
ON "Chat"("userId", "createdAt" DESC);

-- 14. 연락처 최적화
CREATE INDEX IF NOT EXISTS idx_contact_created_desc 
ON "Contact"("createdAt" DESC);

-- 15. 텍스트 검색 인덱스 (기본 영어 설정)
CREATE INDEX IF NOT EXISTS idx_blogpost_title_search 
ON "BlogPost" USING GIN(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_boardpost_title_search 
ON "BoardPost" USING GIN(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_wiki_title_search 
ON "Wiki" USING GIN(to_tsvector('english', title));

-- =====================================================
-- 인덱스 확인 쿼리
-- =====================================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename;