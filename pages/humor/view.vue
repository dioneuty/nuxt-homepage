<template>
  <BoardView
    board-type="humor"
    :api-endpoint="`/api/humorPosts`"
    board-icon="mdi:emoticon-happy-outline"
    :id="$route.query.id"
  >
    <template #extra-info="{ post }">
      <div class="flex items-center mt-2">
        <button @click="likePost" class="flex items-center text-blue-500 hover:text-blue-600">
          <Icon icon="mdi:thumb-up" class="mr-1" />
          좋아요 ({{ post.likes }})
        </button>
      </div>
    </template>
    <template #edit-button>
      <NuxtLink :to="`/humor/write?id=${$route.query.id}`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
        <Icon icon="mdi:pencil" class="mr-2" />
        수정하기
      </NuxtLink>
    </template>
  </BoardView>
</template>

<script setup>
import BoardView from '~/components/board/BoardView.vue'
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const post = ref(null)

const likePost = async () => {
  try {
    const response = await fetch(`/api/humorPosts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: route.query.id }),
    })
    const result = await response.json()
    if (result.success) {
      post.value.likes = result.likes
    }
  } catch (error) {
    console.error('좋아요 업데이트 실패:', error)
  }
}
</script>