<template>
  <BoardIndex
    board-type="adminboard"
    board-title="관리자 게시판"
    board-icon="mdi:shield-account"
    api-endpoint="/api/adminboard"
    header-color-class="bg-blue-100 dark:bg-blue-800"
    :table-headers="tableHeaders"
  />
</template>

<script setup>
import BoardIndex from '~/components/board/BoardIndex.vue'

const tableHeaders = [
  { key: 'id', label: '번호', icon: 'mdi:pound', class: 'hidden sm:table-cell' },
  { key: 'title', label: '제목', icon: 'mdi:format-title' },
  // { key: 'author', label: '작성자', icon: 'mdi:account', class: 'hidden sm:table-cell' },
  { key: 'createdAt', label: '작성일', icon: 'mdi:calendar', class: 'hidden sm:table-cell' }
]

</script>