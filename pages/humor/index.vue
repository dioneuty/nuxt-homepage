<template>
  <BoardIndex
    board-type="humor"
    board-title="유머 게시판"
    board-icon="mdi:emoticon-happy-outline"
    api-endpoint="/api/humorPosts"
    :table-headers="tableHeaders"
  />
</template>

<script setup>
import BoardIndex from '~/components/board/BoardIndex.vue'

definePageMeta ({
  title: '유머 게시판 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 유머 게시판' },
    { name: 'keywords', content: 'Dion, 유머 게시판' }
  ]
})

const tableHeaders = [
  { key: 'id', label: '번호', icon: 'mdi:pound', class: 'hidden sm:table-cell' },
  { key: 'title', label: '제목', icon: 'mdi:format-title' },
  { key: 'author', label: '작성자', icon: 'mdi:account', class: 'hidden sm:table-cell' },
  { key: 'likes', label: '좋아요', icon: 'mdi:thumb-up', class: 'hidden sm:table-cell' },
  { key: 'createdAt', label: '작성일', icon: 'mdi:calendar', class: 'hidden sm:table-cell' }
]
</script>