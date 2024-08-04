// composables/usePosts.js
import { ref } from 'vue'
import { blogPosts, boardPosts } from '~/server/data/npmboardPosts'

export function usePosts() {
  const getBlogPosts = () => ref(blogPosts)
  const getBoardPosts = () => ref(boardPosts)

  return {
    getBlogPosts,
    getBoardPosts
  }
}