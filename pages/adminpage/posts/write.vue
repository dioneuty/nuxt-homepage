<template>
  <BoardWrite
    :board-type="boardType"
    :api-endpoint="apiEndpoint"
    :id="id"
    :is-admin-board="true"
  />
</template>

<script setup>
import BoardWrite from '~/components/board/BoardWrite.vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, computed } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
});

useHead({
  title: '게시글 작성/수정'
});

const { isLoggedIn, user } = useAuth();
const router = useRouter();
const route = useRoute();

const id = computed(() => route.query.id);
const boardType = computed(() => route.query.boardType);

const apiEndpoint = computed(() => {
  if (id.value) {
    return `/api/admin/posts/${id.value}?boardType=${boardType.value}`;
  } else {
    return `/api/admin/posts?boardType=${boardType.value}`;
  }
});

onMounted(() => {
  if (!isLoggedIn.value || user.value?.role !== 'ADMIN') {
    router.push('/');
  }
});
</script> 