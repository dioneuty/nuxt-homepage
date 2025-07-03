import { ref, computed } from 'vue'

/**
 * @function useVideoThreads
 * @description Video thread management composable
 * @returns {Object} Thread management functions and state
 */
export default function useVideoThreads() {
  // Thread storage (will be replaced with Supabase later)
  const threads = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Get threads for a specific video
   * @param {string} videoId - YouTube video ID
   * @returns {Array} Array of threads for the video
   */
  const getThreadsForVideo = (videoId) => {
    return computed(() => 
      threads.value.filter(thread => thread.videoId === videoId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    )
  }

  /**
   * Create a new thread
   * @param {Object} threadData - Thread data
   * @param {string} threadData.videoId - YouTube video ID
   * @param {string} threadData.title - Thread title
   * @param {string} threadData.content - Thread content
   * @returns {Promise<Object>} Created thread
   */
  const createThread = async (threadData) => {
    isLoading.value = true
    error.value = null

    try {
      const newThread = {
        id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        videoId: threadData.videoId,
        title: threadData.title || 'Untitled Thread',
        content: threadData.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'User', // Will be replaced with actual user data
        tags: threadData.tags || []
      }

      threads.value.push(newThread)
      return newThread
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing thread
   * @param {string} threadId - Thread ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated thread
   */
  const updateThread = async (threadId, updates) => {
    isLoading.value = true
    error.value = null

    try {
      const threadIndex = threads.value.findIndex(t => t.id === threadId)
      if (threadIndex === -1) {
        throw new Error('Thread not found')
      }

      const updatedThread = {
        ...threads.value[threadIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      threads.value[threadIndex] = updatedThread
      return updatedThread
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a thread
   * @param {string} threadId - Thread ID
   * @returns {Promise<boolean>} Success status
   */
  const deleteThread = async (threadId) => {
    isLoading.value = true
    error.value = null

    try {
      const threadIndex = threads.value.findIndex(t => t.id === threadId)
      if (threadIndex === -1) {
        throw new Error('Thread not found')
      }

      threads.value.splice(threadIndex, 1)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get thread by ID
   * @param {string} threadId - Thread ID
   * @returns {Object|null} Thread or null if not found
   */
  const getThreadById = (threadId) => {
    return threads.value.find(t => t.id === threadId) || null
  }

  /**
   * Search threads by content or title
   * @param {string} query - Search query
   * @param {string} videoId - Optional video ID to filter by
   * @returns {Array} Matching threads
   */
  const searchThreads = (query, videoId = null) => {
    const searchQuery = query.toLowerCase()
    let filteredThreads = threads.value

    if (videoId) {
      filteredThreads = filteredThreads.filter(t => t.videoId === videoId)
    }

    return filteredThreads.filter(thread => 
      thread.title.toLowerCase().includes(searchQuery) ||
      thread.content.toLowerCase().includes(searchQuery) ||
      thread.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    )
  }

  /**
   * Get thread statistics for a video
   * @param {string} videoId - YouTube video ID
   * @returns {Object} Thread statistics
   */
  const getVideoThreadStats = (videoId) => {
    const videoThreads = threads.value.filter(t => t.videoId === videoId)
    return {
      totalThreads: videoThreads.length,
      lastActivity: videoThreads.length > 0 
        ? Math.max(...videoThreads.map(t => new Date(t.updatedAt).getTime()))
        : null
    }
  }

  return {
    // State
    threads: computed(() => threads.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Methods
    getThreadsForVideo,
    createThread,
    updateThread,
    deleteThread,
    getThreadById,
    searchThreads,
    getVideoThreadStats
  }
}