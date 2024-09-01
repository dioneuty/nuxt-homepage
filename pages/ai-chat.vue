<template>
    <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
      <!-- 사이드바 (채팅 내역) -->
      <div class="w-64 bg-gray-300 dark:bg-gray-600 overflow-y-auto hidden md:block">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4 dark:text-white">채팅 내역</h2>
          <ul>
            <li v-for="chat in chatHistory" :key="chat.id" class="mb-2">
              <button @click="loadChat(chat.id)" class="w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white">
                {{ chat.title }}
              </button>
              <button @click="deleteChat(chat.id)" class="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <!-- 메인 채팅 영역 -->
      <div class="flex-1 flex flex-col">
        <!-- 채팅 메시지 -->
        <div class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800">
          <div v-if="isLoading" class="loading-bar">로딩 중...</div>
          <div v-for="(message, index) in currentChat" :key="index" class="mb-4">
            <div :class="message.role === 'user' ? 'text-right' : 'text-left'">
              <div :class="message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'" class="inline-block p-2 rounded-lg">
                <div v-html="renderMarkdown(message.content)"></div>
              </div>
              <p v-if="message.model" class="text-xs text-gray-500">({{ message.model }})</p>
              <p v-if="message.created" class="text-xs text-gray-500">({{ formatDate(message.created) }})</p>
            </div>
          </div>
        </div>
  
        <!-- 입력 영역 -->
        <div class="p-4 bg-gray-200 dark:bg-gray-700">
          <form @submit.prevent="sendMessage" class="flex">
            <input v-model="userInput" type="text" placeholder="메시지를 입력하세요..." class="flex-1 p-2 rounded-l-lg dark:bg-gray-800 dark:text-white" />
            <button type="submit" class="bg-blue-500 text-white p-2 rounded-r-lg">전송</button>
          </form>
        </div>
      </div>
    </div>
  </template>
<script setup>
import { ref, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // 또는 다른 스타일을 선택할 수 있습니다.
import { useModal } from '~/composables/useModal'

const { openModal } = useModal()

const chatHistory = ref([])
const currentChat = ref([])
const userInput = ref('')
const currentChatId = ref(null)
const isLoading = ref(false)

onMounted(async () => {
  await loadChatHistory()
})

const formatDate = computed(() => {
  return (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('ko-KR', { hour12: false }) // 24시간제로 설정
  }
})

// marked 설정
marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
})

// 마크다운 렌더링 함수
const renderMarkdown = (content) => {
  return marked(content)
}

onMounted(() => {
  hljs.highlightAll();
})

// 채팅 삭제
async function deleteChat(chatId) {
  openModal('확인', '이 채팅을 삭제하시겠습니까?', async (confirmed) => {
    if (confirmed) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', chatId: chatId })
        })
        const data = await response.json()
        if (data.success) {
          openModal('삭제', `채팅내역이 삭제되었습니다.`)
          chatHistory.value = chatHistory.value.filter(chat => chat.id !== chatId)
          if (currentChat.value.id === chatId) {
            currentChat.value = []
          }
        } else {
          console.error(data.error)
        }
      } catch (error) {
        console.error('채팅 삭제 오류:', error)
      }
    }
  }, true)
}

async function loadChatHistory() {
  isLoading.value = true
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'load' })
    })
    const data = await response.json()
    if (data.success) {
      chatHistory.value = data.chats
    }
  } catch (error) {
    console.error('채팅 내역 로드 중 오류:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadChat(chatId) {
  const chat = chatHistory.value.find(c => c.id === chatId)
  if (chat) {
    currentChat.value = JSON.parse(chat.messages)
    currentChatId.value = chatId
  }
}

// 페이지를 떠나기 전에 채팅 내역 저장
onBeforeRouteLeave(async (to, from, next) => {
  if (to.name !== 'ai-chat' && currentChatId.value) {
    await saveChat()
  }
  next()
})

// 채팅 내역 저장 함수
async function saveChat() {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        chatId: currentChatId.value,
        title: currentChat.value[0].content.substring(0, 50),
        messages: currentChat.value,
      })
    })

    const data = await response.json()

    if (data.success) {
      console.log('채팅이 성공적으로 저장되었습니다.')
    } else {
      console.error('채팅 저장 중 오류가 발생했습니다:', data.error)
    }
  } catch (error) {
    console.error('채팅 저장 중 오류가 발생했습니다:', error)
  }
}

async function sendMessage() {
  if (!userInput.value.trim()) return

  currentChat.value.push({ role: 'user', content: userInput.value, created: Math.floor(Date.now() / 1000) })

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'chat', message: userInput.value, chatId: currentChatId.value })
    })

    const data = await response.json()
    console.log(data)
    if (data.success) {
      currentChat.value.push({ role: 'assistant', content: data.message, model: data.model, created: data.created, id: data.chatId })
      if (data.chatId && !currentChatId.value) {
        currentChatId.value = data.chatId
        await loadChatHistory()
      }
    } else {
      console.error('API 요청 실패:', data.error)
    }

    userInput.value = ''
  } catch (error) {
    console.error('Error:', error)
    alert('메시지 전송 중 오류가 발생했습니다.')
  }
}
</script>

<style>
.loading-bar {
  background-color: #3b82f6; /* 파란색 로딩 바 */
  width: 100%;
  height: 4px;
  animation: loading 1s infinite;
}

@keyframes loading {
  0% { width: 0; }
  50% { width: 100%; }
  100% { width: 0; }
}

/* 마크다운 스타일 */
.hljs {
  background: #2d2d2d;
  color: #ccc;
  border-radius: 0.375rem;
  padding: 1rem;
}

/* 인라인 코드 스타일 */
code:not(.hljs) {
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 0.375rem;
  padding: 0.2em 0.4em;
  font-size: 85%;
}

/* 다크 모드에서의 인라인 코드 스타일 */
.dark code:not(.hljs) {
  background-color: rgba(110, 118, 129, 0.4);
}

/* 기타 마크다운 요소 스타일 */
h1, h2, h3, h4, h5, h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

ul, ol {
  padding-left: 1.5em;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  color: #666;
}

.dark blockquote {
  border-left-color: #4a5568;
  color: #a0aec0;
}
</style>