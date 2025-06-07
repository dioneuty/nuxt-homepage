export default defineEventHandler(async (event) => {
  // TODO: 데이터베이스에서 실제 게시글 목록 조회 로직 구현
  const dummyPosts = [
    { id: 1, title: '첫 번째 공지사항', author: 'admin', createdAt: new Date() },
    { id: 2, title: '홈페이지 버그 수정 안내', author: 'admin', createdAt: new Date() },
  ];
  return { posts: dummyPosts };
}); 