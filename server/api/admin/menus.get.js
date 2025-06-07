export default defineEventHandler(async (event) => {
  // TODO: 데이터베이스 또는 설정 파일에서 실제 메뉴 목록 조회 로직 구현
  const dummyMenus = [
    { id: 1, name: '소개', path: '/about', order: 1 },
    { id: 2, name: '게시판', path: '/board', order: 2 },
    { id: 3, name: '갤러리', path: '/gallery', order: 3 },
  ];
  return { menus: dummyMenus };
}); 