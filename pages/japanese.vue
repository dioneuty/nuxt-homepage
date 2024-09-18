<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 dark:text-white flex items-center">
      <Icon icon="mdi:translate" class="mr-2" />
      일본어 학습
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">일본어 학습 자료</h2>
        <ul class="list-disc list-inside dark:text-gray-300">
          <li>히라가나/가타카나</li>
          <li>기초 문법</li>
          <li>한자 학습</li>
          <li>회화 연습</li>
        </ul>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">추천 학습 방법</h2>
        <p class="dark:text-gray-300">
          일본 드라마나 애니메이션을 자주 보는 것이 도움이 됩니다. 또한, 일본어로 된 만화를 읽어보세요.
        </p>
      </div>
    </div>
    
    <!-- 일본어 읽기 섹션 토글 버튼 -->
    <div class="mb-4">
      <button @click="toggleReadingSection" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ isReadingSectionVisible ? '일본어 읽기 숨기기' : '일본어 읽기 보이기' }}
      </button>
    </div>
    
    <!-- 일본어 읽기 섹션 -->
    <div v-if="isReadingSectionVisible" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">일본어 읽기 연습</h2>
      <div class="mb-4">
        <label for="speed" class="block dark:text-white">속도 조절:</label>
        <input type="range" id="speed" v-model="speed" min="0.5" max="2" step="0.1" class="w-full">
        <span class="dark:text-white">{{ speed }}x</span>
      </div>
      <div class="mb-4">
        <label for="interval" class="block dark:text-white">문장 간 간격 (초):</label>
        <input type="range" id="interval" v-model="interval" min="0" max="5" step="0.5" class="w-full">
        <span class="dark:text-white">{{ interval }}초</span>
      </div>
      <div class="mb-4">
        <button @click="playAll" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">전체 재생</button>
        <button @click="playHundred" class="bg-green-500 text-white px-4 py-2 rounded mr-2">100문장 재생</button>
        <button @click="playChecked" class="bg-purple-500 text-white px-4 py-2 rounded mr-2">체크된 항목 재생</button>
        <button @click="stopPlayback" class="bg-red-500 text-white px-4 py-2 rounded mr-2">정지</button>
        <button @click="togglePauseResume" class="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
          {{ isPaused ? '재개' : '일시정지' }}
        </button>
        <button @click="resetSentences" class="bg-gray-500 text-white px-4 py-2 rounded mr-2">리셋</button>
        <input type="file" @change="importTXT" accept=".txt" class="mt-2">
      </div>
      <div id="sentenceList" class="mt-4 max-h-60 overflow-y-auto">
        <p v-if="sentences.length === 0" class="dark:text-gray-300">문장이 없습니다. 텍스트 파일을 가져와주세요.</p>
        <ul v-else>
          <li v-for="(sentence, index) in sentences" :key="index" :class="{ 'bg-gray-200 dark:bg-gray-700': index === currentIndex }">
            <input type="checkbox" v-model="checkedSentences[index]" class="mr-2">
            <span class="mr-2 text-gray-500">{{ index + 1 }}</span>
            <span @click="speak(index)" class="cursor-pointer hover:underline dark:text-gray-300">{{ sentence }}</span>
          </li>
        </ul>
      </div>
      <div class="mt-4 dark:text-white">
        <p>총 문장 수: {{ sentences.length }}</p>
        <p>현재 재생 중: {{ currentPlayingSentence }}</p>
        <p>마지막으로 재생한 문장: {{ lastPlayedSentence }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'

const sentences = ref([])
const currentIndex = ref(0)
const endIndex = ref(0)
const isPlaying = ref(false)
const isPaused = ref(false)
const currentUtterance = ref(null)
const lastPlayedIndex = ref(-1)
const speed = ref(1)
const interval = ref(1)
const currentPlayingSentence = ref('')
const lastPlayedSentence = ref('')
const isReadingSectionVisible = ref(false)
const checkedSentences = ref([])

function toggleReadingSection() {
  isReadingSectionVisible.value = !isReadingSectionVisible.value
}

function speak(index) {
  const text = sentences.value[index]
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = speed.value
  
  utterance.onstart = () => {
    currentPlayingSentence.value = text
    lastPlayedIndex.value = index
    lastPlayedSentence.value = `${index + 1}: ${text}`
  }
  
  utterance.onend = () => {
    if (isPlaying.value && !isPaused.value) {
      currentIndex.value++
      if (currentIndex.value < endIndex.value) {
        setTimeout(() => {
          if (checkedSentences.value[index]) {
            playNextChecked(checkedSentences.value.reduce((acc, checked, idx) => {
              if (checked) acc.push(idx)
              return acc
            }, []))
          } else {
            playNext()
          }
        }, interval.value * 1000)
      } else {
        isPlaying.value = false
        currentPlayingSentence.value = ''
      }
    }
  }
  
  speechSynthesis.speak(utterance)
  currentUtterance.value = utterance
}

function playAll() {
  if (sentences.value.length === 0) {
    alert('문장이 없습니다. 먼저 텍스트 파일을 가져와주세요.')
    return
  }
  currentIndex.value = 0
  endIndex.value = sentences.value.length
  isPlaying.value = true
  isPaused.value = false
  playNext()
}

function playHundred() {
  if (sentences.value.length === 0) {
    alert('문장이 없습니다. 먼저 텍스트 파일을 가져와주세요.')
    return
  }
  currentIndex.value = 0
  endIndex.value = Math.min(100, sentences.value.length)
  isPlaying.value = true
  isPaused.value = false
  playNext()
}

function playNext() {
  if (isPlaying.value && !isPaused.value && currentIndex.value < endIndex.value) {
    speak(currentIndex.value)
  }
}

function stopPlayback() {
  isPlaying.value = false
  isPaused.value = false
  if (currentUtterance.value) {
    speechSynthesis.cancel()
  }
  currentPlayingSentence.value = ''
}

function togglePauseResume() {
  if (isPlaying.value) {
    if (isPaused.value) {
      isPaused.value = false
      speechSynthesis.resume()
    } else {
      isPaused.value = true
      speechSynthesis.pause()
    }
  }
}

function resetSentences() {
  sentences.value = []
  checkedSentences.value = []
  stopPlayback()
  lastPlayedIndex.value = -1
  lastPlayedSentence.value = ''
  alert('문장이 리셋되었습니다.')
}

function importTXT(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        const importedSentences = content.split('\n').filter(line => line.trim() !== '')
        if (importedSentences.length > 0) {
          sentences.value = importedSentences
          checkedSentences.value = new Array(importedSentences.length).fill(false)
          alert('텍스트 파일이 성공적으로 가져와졌습니다.')
        } else {
          throw new Error('빈 파일이거나 유효한 문장이 없습니다.')
        }
      } catch (error) {
        alert('텍스트 파일 가져오기에 실패했습니다. 파일 형식을 확인해주세요.')
        console.error('텍스트 가져오기 오류:', error)
      }
    }
    reader.readAsText(file)
  }
}

function playChecked() {
  const checkedIndices = checkedSentences.value.reduce((acc, checked, index) => {
    if (checked) acc.push(index)
    return acc
  }, [])
  
  if (checkedIndices.length === 0) {
    alert('체크된 문장이 없습니다. 먼저 문장을 체크해주세요.')
    return
  }
  
  currentIndex.value = 0
  endIndex.value = checkedIndices.length
  isPlaying.value = true
  isPaused.value = false
  playNextChecked(checkedIndices)
}

function playNextChecked(checkedIndices) {
  if (isPlaying.value && !isPaused.value && currentIndex.value < endIndex.value) {
    speak(checkedIndices[currentIndex.value])
  }
}

onMounted(() => {
  // 필요한 초기화 로직
})

definePageMeta({
  title: '일본어 학습 - Dion',
  meta: [
    { name: 'description', content: 'Dion - 일본어 학습 페이지' },
    { name: 'keywords', content: 'Dion, 일본어, 학습, 외국어' }
  ]
})
</script>