<template>
  <BoardView
    board-type="adminpage/posts"
    :api-endpoint="`/api/admin/posts?boardType=${$route.query.boardType}`"
    board-icon="mdi:text-box-multiple"
    :id="$route.query.id"
    :is-admin-board="true"
  >
    <template #edit-button>
      <NuxtLink 
        :to="`/adminpage/posts/write?id=${$route.query.id}&boardType=${$route.query.boardType}`"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <Icon icon="mdi:pencil" class="mr-2" />
        수정하기
      </NuxtLink>
    </template>
    <template #delete-button>
      <button
        @click="deletePost($route.query.id, $route.query.boardType)"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ml-2"
      >
        <Icon icon="mdi:delete" class="mr-2" />
        삭제하기
      </button>
    </template>
  </BoardView>
</template>

<script setup>
import BoardView from '~/components/board/BoardView.vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
});

useHead({
  title: '게시글 상세'
});

const { isLoggedIn, user } = useAuth();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (!isLoggedIn.value || user.value?.role !== 'ADMIN') {
    router.push('/');
  }
});

async function deletePost(id, boardType) {
  if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    return;
  }
  try {
    await $fetch(`/api/admin/posts/${id}`, {
      method: 'DELETE',
      params: { boardType: boardType },
    });
    alert('게시글이 삭제되었습니다.');
    router.push(`/adminpage/posts?boardType=${boardType}`);
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    alert('게시글 삭제에 실패했습니다.');
  }
}
</script> 