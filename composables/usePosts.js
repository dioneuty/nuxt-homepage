// composables/usePosts.js
import { ref } from 'vue'
import { blogPosts, boardPosts } from '~/server/data/npmboardPosts'

/**
 * 블로그 및 게시판 게시글 데이터를 가져오는 컴포저블 함수입니다.
 * @returns {Object} 게시글 관련 함수
 * @property {function(): Ref<Array<Object>>} getBlogPosts - 블로그 게시글 목록을 반환하는 함수
 * @property {function(): Ref<Array<Object>>} getBoardPosts - 게시판 게시글 목록을 반환하는 함수
 */
export function usePosts() {
  /**
   * 블로그 게시글 목록을 반환합니다.
   * @returns {Ref<Array<Object>>} - 블로그 게시글 배열의 반응형 참조
   */
  function getBlogPosts() {
    return ref(blogPosts)
  }

  /**
   * 게시판 게시글 목록을 반환합니다.
   * @returns {Ref<Array<Object>>} - 게시판 게시글 배열의 반응형 참조
   */
  function getBoardPosts() {
    return ref(boardPosts)
  }

  return {
    getBlogPosts,
    getBoardPosts
  }
}