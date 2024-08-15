<template>
  <div class="container mx-auto px-4 py-8 dark:bg-gray-800 dark:text-white">
    <div v-if="isLoaded && qna">
      <div v-if="!isEditingQuestion">
        <h1 class="text-3xl font-bold mb-4 dark:text-white flex items-center">
          <Icon icon="mdi:help-circle" class="mr-2" />
          {{ qna.questionTitle }}
        </h1>
        <div class="mb-4 text-gray-600 dark:text-gray-400 flex items-center">
          <Icon icon="mdi:account" class="mr-1" />
          작성자: {{ qna.author }} | 
          <Icon icon="mdi:calendar" class="ml-2 mr-1" />
          작성일: {{ formatDate(qna.createdAt) }}
        </div>
        <div class="mb-8 p-4 bg-gray-100 rounded dark:bg-gray-700">
          <h2 class="text-xl font-semibold mb-2 dark:text-white flex items-center">
            <Icon icon="mdi:comment-question-outline" class="mr-2" />
            질문 내용
          </h2>
          <p class="dark:text-gray-300">{{ qna.questionContent }}</p>
          <div class="mt-4 flex items-center">
            <button @click="startEditingQuestion" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2 flex items-center">
              <Icon icon="mdi:pencil" class="mr-2" />
              질문 수정
            </button>
            <button @click="deleteQnA" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2 flex items-center">
              <Icon icon="mdi:delete" class="mr-2" />
              질문 삭제
            </button>
          </div>
        </div>
      </div>
      <div v-else>
        <h2 class="text-2xl font-bold mb-4 dark:text-white">질문 수정</h2>
        <form @submit.prevent="updateQuestion">
          <div class="mb-4">
            <label for="questionTitle" class="block mb-2 dark:text-white">제목</label>
            <input v-model="editedQuestion.title" id="questionTitle" type="text" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
          </div>
          <div class="mb-4">
            <label for="questionContent" class="block mb-2 dark:text-white">내용</label>
            <textarea v-model="editedQuestion.content" id="questionContent" rows="5" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required></textarea>
          </div>
          <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
            저장
          </button>
          <button @click="cancelEditingQuestion" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            취소
          </button>
        </form>
      </div>

      <div v-if="qna.answerContent && !isEditingAnswer" class="mt-8 mb-8 p-4 bg-blue-100 rounded dark:bg-blue-900">
        <h2 class="text-xl font-semibold mb-2 dark:text-white flex items-center">
          <Icon icon="mdi:comment-text-outline" class="mr-2" />
          답변
        </h2>
        <p class="dark:text-gray-300">{{ qna.answerContent }}</p>
        <div class="mt-2 text-gray-600 dark:text-gray-400 flex items-center">
          <Icon icon="mdi:account" class="mr-1" />
          답변자: {{ qna.answerer }} | 
          <Icon icon="mdi:calendar" class="ml-2 mr-1" />
          답변일: {{ formatDate(qna.updatedAt) }}
        </div>
        <div class="mt-4 flex items-center">
          <button @click="startEditingAnswer" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2 flex items-center">
            <Icon icon="mdi:pencil" class="mr-2" />
            답변 수정
          </button>
          <button @click="deleteAnswer" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center">
            <Icon icon="mdi:delete" class="mr-2" />
            답변 삭제
          </button>
        </div>
      </div>

      <div v-else-if="isEditingAnswer" class="mt-8">
        <h2 class="text-2xl font-bold mb-4 dark:text-white">답변 수정</h2>
        <form @submit.prevent="updateAnswer">
          <div class="mb-4">
            <label for="answerContent" class="block mb-2 dark:text-white">답변 내용</label>
            <textarea v-model="editedAnswer" id="answerContent" rows="5" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required></textarea>
          </div>
          <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
            저장
          </button>
          <button @click="cancelEditingAnswer" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            취소
          </button>
        </form>
      </div>

      <div v-else-if="!qna.answerContent" class="mt-8">
        <h2 class="text-2xl font-bold mb-4 dark:text-white">답변 작성</h2>
        <form @submit.prevent="submitAnswer">
          <div class="mb-4">
            <label for="newAnswerContent" class="block mb-2 dark:text-white">답변 내용</label>
            <textarea v-model="newAnswer" id="newAnswerContent" rows="5" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" required></textarea>
          </div>
          <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            답변 등록
          </button>
        </form>
      </div>

      <div class="mt-8">
        <NuxtLink to="/qna" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          목록으로
        </NuxtLink>
      </div>
    </div>
    <div v-else-if="isLoaded" class="dark:text-white">
      질문을 찾을 수 없습니다.
    </div>
    <div v-else class="dark:text-white">
      데이터를 불러오는 중입니다...
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()
const qna = ref(null)
const isLoaded = ref(false)
const newAnswer = ref('')
const isEditingQuestion = ref(false)
const isEditingAnswer = ref(false)
const editedQuestion = reactive({ title: '', content: '' })
const editedAnswer = ref('')

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('ko-KR') : ''
}

const fetchQnA = async () => {
  try {
    const { data } = await useFetch(`/api/qna`, {
      params: { id: route.query.id }
    })
    qna.value = data.value
  } catch (error) {
    console.error('Error fetching QnA:', error)
  } finally {
    isLoaded.value = true
  }
}

const startEditingQuestion = () => {
  editedQuestion.title = qna.value.questionTitle
  editedQuestion.content = qna.value.questionContent
  isEditingQuestion.value = true
}

const cancelEditingQuestion = () => {
  isEditingQuestion.value = false
}

const updateQuestion = async () => {
  try {
    await useFetch(`/api/qna`, {
      method: 'PUT',
      body: { 
        id: qna.value.id, 
        questionTitle: editedQuestion.title,
        questionContent: editedQuestion.content
      }
    })
    await fetchQnA()
    isEditingQuestion.value = false
  } catch (error) {
    console.error('Error updating question:', error)
  }
}

const startEditingAnswer = () => {
  editedAnswer.value = qna.value.answerContent
  isEditingAnswer.value = true
}

const cancelEditingAnswer = () => {
  isEditingAnswer.value = false
}

const updateAnswer = async () => {
  try {
    await useFetch(`/api/qna`, {
      method: 'PUT',
      body: { 
        id: qna.value.id, 
        answerContent: editedAnswer.value
      }
    })
    await fetchQnA()
    isEditingAnswer.value = false
  } catch (error) {
    console.error('Error updating answer:', error)
  }
}

const deleteAnswer = async () => {
  if (confirm('정말로 이 답변을 삭제하시겠습니까?')) {
    try {
      await useFetch(`/api/qna`, {
        method: 'PUT',
        body: { 
          id: qna.value.id, 
          answerContent: null,
          answerer: null
        }
      })
      await fetchQnA()
    } catch (error) {
      console.error('Error deleting answer:', error)
    }
  }
}

const deleteQnA = async () => {
  if (confirm('정말로 이 질문을 삭제하시겠습니까?')) {
    try {
      await useFetch(`/api/qna`, {
        method: 'DELETE',
        body: { id: qna.value.id }
      })
      router.push('/qna')
    } catch (error) {
      console.error('Error deleting QnA:', error)
    }
  }
}

const submitAnswer = async () => {
  try {
    await useFetch(`/api/qna`, {
      method: 'PUT',
      body: { 
        id: qna.value.id, 
        answerContent: newAnswer.value,
        answerer: '현재 로그인한 사용자' // 실제 구현 시 로그인 사용자 정보를 사용해야 합니다.
      }
    })
    newAnswer.value = ''
    await fetchQnA()
  } catch (error) {
    console.error('Error submitting answer:', error)
  }
}

onMounted(() => {
  fetchQnA()
})
</script>