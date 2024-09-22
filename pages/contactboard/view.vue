<template>
  <BoardView
    board-type="contactboard"
    :api-endpoint="`/api/contact`"
    board-icon="mdi:message-text"
    :id="$route.query.id"
  >
    <template #extra-info="{ post }">
      <div class="text-gray-600 dark:text-gray-300 mb-2 flex items-center">
        <Icon icon="mdi:email" class="mr-2" />
        이메일: {{ post.title }}
      </div>
    </template>
  </BoardView>
</template>

<script setup>
import BoardView from '~/components/board/BoardView.vue'

</script>