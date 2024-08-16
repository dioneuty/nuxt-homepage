<template>
  <BoardView
    board-type="adminboard"
    :api-endpoint="`/api/adminboard?id=${$route.query.id}`"
    board-icon="mdi:shield-account"
  >
    <template #edit-button>
      <NuxtLink :to="`/adminboard/write?id=${$route.query.id}`" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
        <Icon icon="mdi:pencil" class="mr-2" />
        수정하기
      </NuxtLink>
    </template>
  </BoardView>
</template>

<script setup>
import BoardView from '~/components/board/BoardView.vue'

</script>