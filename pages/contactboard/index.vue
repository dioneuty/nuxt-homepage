<template>
  <BoardIndex
    board-type="contactboard"
    board-title="문의 게시판"
    board-icon="mdi:message-text"
    api-endpoint="/api/contact"
    header-color-class="bg-purple-100 dark:bg-purple-800"
    :table-headers="tableHeaders"
    :show-write-button="false"
  >
    <template #write-button>
      <!-- 문의 게시판에는 새 글 작성 버튼이 필요 없을 수 있으므로 빈 템플릿으로 대체 -->
    </template>
  </BoardIndex>
</template>

<script setup>
import BoardIndex from '~/components/board/BoardIndex.vue'

const tableHeaders = [
  { key: 'id', label: '번호', icon: 'mdi:pound', class: 'hidden sm:table-cell' },
  { key: 'title', label: '문의제목', icon: 'mdi:format-title' },
  { key: 'author', label: '문의자', icon: 'mdi:account', class: 'hidden sm:table-cell' },
  { key: 'email', label: '이메일', icon: 'mdi:email', class: 'hidden sm:table-cell' },
  { key: 'content', label: '문의내용', icon: 'mdi:account', class: 'hidden sm:table-cell' },
  { key: 'createdAt', label: '문의일', icon: 'mdi:calendar', class: 'hidden sm:table-cell' }
]

</script>