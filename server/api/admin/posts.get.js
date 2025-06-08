/**
 * @file 관리자 게시글 목록 조회 API
 * @description 관리자 페이지에서 사용할 게시글 목록을 조회합니다.
 *              현재는 더미 데이터를 반환하며, 향후 데이터베이스에서 실제 게시글 데이터를 가져오도록 구현해야 합니다.
 */
export default defineEventHandler(async (event) => {
  // TODO: 데이터베이스에서 실제 게시글 목록 조회 로직 구현
  // 현재는 임시 더미 데이터를 반환합니다.
  const dummyPosts = [
    { id: 1, title: '첫 번째 공지사항', author: 'admin', createdAt: new Date() },
    { id: 2, title: '홈페이지 버그 수정 안내', author: 'admin', createdAt: new Date() },
  ];
  return { posts: dummyPosts };
}); 