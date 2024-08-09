// composables/usePosts.js
import { ref } from 'vue'
import { blogPosts, boardPosts } from '~/server/data/npmboardPosts'

/**
 * 블로그 게시글 데이터를 가져오는 컴포저블
 * @returns {Object} - 블로그 게시글 데이터
 */
export function usePosts() {
  const getBlogPosts = () => ref(blogPosts)
  const getBoardPosts = () => ref(boardPosts)

  return {
    getBlogPosts,
    getBoardPosts
  }
}