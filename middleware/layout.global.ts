export default defineNuxtRouteMiddleware((to) => {
  switch (true) {
    case to.path.startsWith('/blog') && !to.path.startsWith('/blog/edit-categories'):
      to.meta.layout = 'blog'
      break
    default:
      to.meta.layout = 'default'
  }
})