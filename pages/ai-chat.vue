<template>
  <div class="flex h-[calc(100vh-4.5rem)] lg:h-screen bg-gray-100 dark:bg-gray-900">
    <!-- 사이드바 (채팅 내역) -->
    <div :class="['w-64 bg-gray-100 dark:bg-gray-600 border-r-gray-600 border-r overflow-y-auto transition-all duration-300 ease-in-out h-[calc(100vh-4.5rem)] lg:h-screen', 
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full', 
                  'md:translate-x-0 md:static absolute z-10 h-full']">
      <div class="p-2">
        <div class="flex items-center justify-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6 text-gray-500 dark:text-gray-400"
          >
            <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"></path>
            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
            <circle cx="12" cy="10" r="2"></circle>
            <line x1="8" x2="8" y1="2" y2="4"></line>
            <line x1="16" x2="16" y1="2" y2="4"></line>
          </svg>
          <h1 class="text-lg font-bold text-gray-800 dark:text-gray-200">Chat History</h1>
        </div>
        <button @click="startNewChat" class="w-full bg-blue-500 text-white p-2 rounded mb-4 hover:bg-blue-600 transition-colors">
          새 채팅 시작
        </button>
        <ul>
          <li v-for="chat in chatHistory" :key="chat.screenId" class="flex justify-between items-center">
            <button @click="loadChat(chat.screenId)" class="w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white">
              {{ chat.title }}
            </button>
            <button @click="deleteChat(chat.screenId)" class="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
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
      <header class="flex items-center justify-between p-4 bg-gray-800 dark:bg-gray-900 text-white">
        <div class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6 text-white"
          >
            <path d="M12 8V4H8"></path>
            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
            <path d="M2 14h2"></path>
            <path d="M20 14h2"></path>
            <path d="M15 13v2"></path>
            <path d="M9 13v2"></path>
          </svg>
          <span class="ml-2 text-xl font-bold">ChatGPT</span>
          <!-- 사이드바 토글 버튼 (모바일용) -->
          <button @click="toggleSidebar" class="md:hidden bg-blue-500 text-white p-2 rounded-full shadow-lg absolute right-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18a1 1 0 011 1v12a1 1 0 01-1 1H4l-1 3v-3H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
            </svg>
          </button>
        </div>
      </header>
      <!-- 채팅 메시지 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800">
        <div v-if="isLoading" class="loading-bar">로딩 중...</div>
        <div v-for="(message, index) in currentChat" :key="index" class="mb-4">
          <div :class="message.role === 'user' ? 'text-right' : 'text-left'">
            <div :class="message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'" class="inline-block p-2 rounded-lg" @click="handleClick">
                <div v-if="message.content" v-html="renderMarkdown(message.content)"></div>
                <div v-else class="text-gray-500 italic">빈 메시지</div>
            </div>
            <p v-if="message.model" class="text-xs text-gray-500">({{ message.model }})</p>
            <p v-if="message.created" class="text-xs text-gray-500">({{ formatDate(message.created, 'HH:mm') }})</p>
          </div>
          <div v-if="isWaiting && index === currentChat.length - 1" class="flex justify-center items-center dark:text-white">
            <svg class="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"></path>
            </svg>
            기다리는 중...
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
import { ref, onMounted, nextTick, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import kotlin from 'highlight.js/lib/languages/kotlin';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';

import 'highlight.js/styles/github-dark.css'
import { v4 as uuidv4 } from 'uuid'

// 페이지 제목과 설명을 동적으로 설정
definePageMeta ({
  title: 'AI 채팅 - Dion',
  meta: [
    { name: 'description', content: 'AI와 대화를 나눌 수 있는 채팅 페이지입니다.' },
    { name: 'keywords', content: 'AI, 채팅, 대화, Dion' }
  ]
})

//반복문으로 언어 등록
const languages = [
  { name: 'javascript', lang: javascript },
  { name: 'python', lang: python },
  { name: 'css', lang: css },
  { name: 'sql', lang: sql },
  { name: 'json', lang: json },
  { name: 'markdown', lang: markdown },
  { name: 'bash', lang: bash },
  { name: 'typescript', lang: typescript }, 
  { name: 'java', lang: java },
  { name: 'csharp', lang: csharp },
  { name: 'cpp', lang: cpp },
  { name: 'go', lang: go },
  { name: 'kotlin', lang: kotlin },
  { name: 'php', lang: php },
  { name: 'ruby', lang: ruby },
]
languages.forEach(item => {
  hljs.registerLanguage(item.name, item.lang);
});

const chatHistory = ref([])
const currentChat = ref([])
const userInput = ref('')
const currentScreenId = ref(null)
const isLoading = ref(false)
const isSidebarOpen = ref(false)
const isWaiting = ref(false)
const chatContainer = ref(null)

onMounted(async () => {
  await loadChatHistory()
  startNewChat()
})

function startNewChat() {
  currentChat.value = []
  currentScreenId.value = uuidv4()
  userInput.value = ''
}

async function sendMessage() {
  if (!userInput.value.trim()) return

  const userMessage = { role: 'user', content: userInput.value, created: Math.floor(Date.now() / 1000) }
  currentChat.value.push(userMessage)

  try {
    isWaiting.value = true
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'chat', 
        message: userInput.value, 
        screenId: currentScreenId.value
      })
    })

    const data = await response.json()
    if (data.success) {
      const assistantMessage = { role: 'assistant', content: data.message, model: data.model, created: data.created }
      currentChat.value.push(assistantMessage)
      updateChatHistory()
    } else {
      console.error('API 요청 실패:', data.error)
    }

    userInput.value = ''
  } catch (error) {
    console.error('Error:', error)
    alert('메시지 전송 중 오류가 발생했습니다.')
  } finally {
    isWaiting.value = false
  }
}

async function loadChatHistory() {
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
  }
}

function updateChatHistory() {
  const existingChatIndex = chatHistory.value.findIndex(chat => chat.screenId === currentScreenId.value)
  const updatedChat = {
    screenId: currentScreenId.value,
    title: currentChat.value[0]?.content.substring(0, 30) || '새 채팅',
    messages: JSON.stringify(currentChat.value)
  }

  if (existingChatIndex !== -1) {
    chatHistory.value[existingChatIndex] = updatedChat
  } else {
    chatHistory.value.unshift(updatedChat)
  }

  saveChatToServer(updatedChat)
}

async function saveChatToServer(chat) {
  try {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        screenId: chat.screenId,
        title: chat.title,
        messages: chat.messages
      })
    })
  } catch (error) {
    console.error('채팅 저장 중 오류:', error)
  }
}

async function loadChat(screenId) {
  const chat = chatHistory.value.find(c => c.screenId === screenId)
  console.log(chat)
  if (chat) {
    currentChat.value = JSON.parse(chat.messages)
    currentScreenId.value = chat.screenId
  }
}

async function deleteChat(screenId) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', screenId: screenId })
    })
    const data = await response.json()
    if (data.success) {
      chatHistory.value = chatHistory.value.filter(chat => chat.screenId !== screenId)
      if (currentScreenId.value === screenId) {
        startNewChat()
      }
    }
  } catch (error) {
    console.error('채팅 삭제 중 오류:', error)
  }
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function renderMarkdown(content) {
  if (!content) return ''; 

  marked.setOptions({
    highlight: function (code) {
      if (code.lang && hljs.getLanguage(code.lang)) {
        try {
          return hljs.highlight(code, { language: code.lang }).value;
        } catch (e) {
          console.error('Highlight.js error:', e);
          return code;
        }
      }
      return code;
    },
    langPrefix: 'hljs language-'
  });

  const renderer = new marked.Renderer();
  renderer.code = (code) => {
    let highlightedCode = code;
    try {
        if (code.lang && hljs.getLanguage(code.lang)) {
        // 언어가 지정되고 해당 언어가 지원되는 경우
        highlightedCode = hljs.highlight(code.text, { language : code.lang });
        console.log(highlightedCode)
        } else {
        // 언어가 지정되지 않았거나 지원되지 않는 경우 자동 감지
        highlightedCode = hljs.highlightAuto(code.text);
        }

    } catch (error) {
        console.error('Highlight.js error:', error);
    }

    return `<div class="code-block-wrapper">
              <pre><code class="hljs ${code.lang || ''}">${highlightedCode.value}</code></pre>
              <button class="copy-button" @click="copyCode">복사</button>
            </div>`;
  };

  try {
    return marked(content, { renderer: renderer });
  } catch (e) {
    console.error('Marked error:', e);
    return content;
  }
}

function handleClick(event) {
  if (event.target.classList.contains('copy-button')) {
    copyCode(event);
  }
}

function copyCode(event) {
  const button = event.target;
  const pre = button.previousElementSibling;
  const code = pre.querySelector('code');
  navigator.clipboard.writeText(code.textContent).then(() => {
    button.textContent = '복사됨!';
    setTimeout(() => {
      button.textContent = '복사';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}


function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString()
}

// 스크롤을 가장 아래로 이동시키는 함수
function scrollToBottom() {
  if (chatContainer.value) {
    nextTick(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    })
  }
}

// 채팅 메시지가 추가될 때마다 스크롤 이동
watch(() => currentChat.value, () => {
  scrollToBottom()
}, { deep: true })

// 컴포넌트가 마운트된 후 초기 스크롤 설정
onMounted(() => {
  scrollToBottom()
})

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
  border-radius: 0.375rem;
  padding: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.code-block-wrapper {
  position: relative;
}

.copy-button {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 5px 10px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
}

.copy-button:hover {
  background-color: #2d3748;
}


/* 코드 블록 내부의 pre 태그에 대한 스타일 */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.8rem;
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

/* 채팅 메시지 글씨 크기 조정 */
.chat-message {
  font-size: 0.9rem; /* 기본 글씨 크기보다 약간 작게 설정 */
}

/* 채팅 메시지 내 마크다운 요소들의 글씨 크기 조정 */
.chat-message h1 { font-size: 1.5em; }
.chat-message h2 { font-size: 1.3em; }
.chat-message h3 { font-size: 1.1em; }
.chat-message h4, h5, h6 { font-size: 1em; }
.chat-message p, ul, ol, blockquote { font-size: 0.9rem; }

/* 코드 블록 글씨 크기 조정 */
.chat-message .hljs {
  font-size: 0.5rem;
}
</style>