/**
 * 전역 레이아웃 미들웨어입니다. 라우트 경로에 따라 동적으로 레이아웃을 설정합니다.
 * @param {object} to - 대상 라우트 객체
 * @returns {void}
 */
export default defineNuxtRouteMiddleware((to) => {
  switch (true) {
    case to.path.startsWith('/blog') && !to.path.startsWith('/blog/edit-categories'):
      to.meta.layout = 'blog'
      break
    case to.path.startsWith('/ai-chat'):
      to.meta.layout = 'aichat-layout'
      break
    case to.path.startsWith('/adminpage'):
      to.meta.layout = 'admin'
      break
    default:
      to.meta.layout = 'default'
  }
})