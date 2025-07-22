<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">데이터베이스 백업 및 복구</h1>

    <!-- localhost 에서만 보이기 -->
    <div v-if="isLocalhost" class="space-y-6">
      <!-- DB 백업 섹션 -->
      <section class="border p-4 rounded-lg shadow-sm dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-3 dark:text-white">데이터베이스 백업</h2>
        <button
          @click="backupDatabase"
          :disabled="backupLoading"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ backupLoading ? '백업 중...' : 'DB 백업' }}
        </button>
        <p v-if="backupMessage" :class="backupError ? 'text-red-500' : 'text-green-500'" class="mt-2">
          {{ backupMessage }}
        </p>
        <div v-if="backupFilePath" class="mt-3">
          <a :href="backupFilePath" download class="text-blue-500 hover:underline">백업 파일 다운로드</a>
        </div>
      </section>

      <!-- DB 복구 섹션 -->
      <section class="border p-4 rounded-lg shadow-sm dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-3 dark:text-white">데이터베이스 복구</h2>
        <input
          type="file"
          @change="handleRestoreFileChange"
          accept=".sql"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
        />
        <button
          @click="confirmRestoreDatabase"
          :disabled="!selectedRestoreFile || restoreLoading"
          class="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {{ restoreLoading ? '복구 중...' : 'DB 복구' }}
        </button>
        <p v-if="restoreMessage" :class="restoreError ? 'text-red-500' : 'text-green-500'" class="mt-2">
          {{ restoreMessage }}
        </p>
      </section>

      <!-- 백업 파일 목록 섹션 -->
      <section class="border p-4 rounded-lg shadow-sm dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-3 dark:text-white">백업 파일 목록</h2>
        <ul v-if="backupFiles.length > 0" class="list-disc pl-5">
          <li v-for="file in backupFiles" :key="file" class="mb-1">
            <a :href="`/api/admin/db/download/${file}`" download class="text-blue-500 hover:underline dark:text-blue-400">
              {{ file }}
            </a>
          </li>
        </ul>
        <p v-else class="text-gray-600 dark:text-gray-400">저장된 백업 파일이 없습니다.</p>
        <button
          @click="fetchBackupFiles"
          class="mt-3 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          목록 새로고침
        </button>
      </section>
    </div>
    <div v-else class="text-lg text-red-500">
      이 기능은 localhost 환경에서만 사용할 수 있습니다.
    </div>

    <!-- 복구 확인 모달 -->
    <Modal :show="showRestoreConfirmModal" @close="showRestoreConfirmModal = false">
      <template #header>
        <h3 class="text-lg font-semibold dark:text-white">데이터베이스 복구 확인</h3>
      </template>
      <template #body>
        <p class="dark:text-gray-300">선택한 파일로 데이터베이스를 복구하시겠습니까? 이 작업은 현재 데이터를 덮어씁니다.</p>
        <p class="font-bold text-red-600">경고: 이 작업은 되돌릴 수 없습니다!</p>
      </template>
      <template #footer>
        <button
          @click="restoreDatabase"
          :disabled="restoreLoading"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 mr-2"
        >
          복구 실행
        </button>
        <button
          @click="showRestoreConfirmModal = false"
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          취소
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from '~/composables/useToast';
import Modal from '~/components/common/Modal.vue';

const { showToast } = useToast();

definePageMeta({
  layout: 'admin',
});

// DB 백업/복구 관련 상태
const isLocalhost = ref(false);
const backupLoading = ref(false);
const backupMessage = ref('');
const backupError = ref(false);
const backupFilePath = ref('');

const selectedRestoreFile = ref<File | null>(null);
const restoreLoading = ref(false);
const restoreMessage = ref('');
const restoreError = ref(false);
const showRestoreConfirmModal = ref(false);

const backupFiles = ref<string[]>([]);


onMounted(() => {
  // 로컬호스트 확인 및 백업 파일 목록 로드
  if (process.client) {
    isLocalhost.value = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
  if (isLocalhost.value) {
    fetchBackupFiles();
  }
});


// DB 백업/복원 관련 함수들
async function backupDatabase() {
  backupLoading.value = true;
  backupMessage.value = '';
  backupError.value = false;
  backupFilePath.value = '';
  try {
    const response = await $fetch('/api/admin/db/backup', { method: 'POST' });
    if (response.success) {
      backupMessage.value = response.message;
      backupFilePath.value = response.filePath;
      backupError.value = false;
      showToast('DB 백업 성공!', 'success');
      fetchBackupFiles(); // 백업 후 목록 새로고침
    } else {
      backupMessage.value = response.message || '알 수 없는 백업 오류 발생.';
      backupError.value = true;
      showToast('DB 백업 실패!', 'error');
    }
  } catch (e: any) { 
    backupMessage.value = e.data?.message || 'DB 백업 중 에러가 발생했습니다.';
    backupError.value = true;
    showToast('DB 백업 에러!', 'error');
    console.error('백업 에러:', e);
  } finally {
    backupLoading.value = false;
  }
}

async function fetchBackupFiles() {
  try {
    const response = await $fetch('/api/admin/db/backups', { method: 'GET' });
    if (response.success) {
      backupFiles.value = response.files;
    } else {
      showToast('백업 파일 목록 조회 실패!', 'error');
      console.error('백업 파일 목록 조회 실패:', response.message);
    }
  } catch (e: any) {
    showToast('백업 파일 목록 조회 에러!', 'error');
    console.error('백업 파일 목록 조회 에러:', e);
  }
}

function handleRestoreFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedRestoreFile.value = target.files[0];
  } else {
    selectedRestoreFile.value = null;
  }
  restoreMessage.value = '';
  restoreError.value = false;
}

function confirmRestoreDatabase() {
  if (selectedRestoreFile.value) {
    showRestoreConfirmModal.value = true;
  } else {
    showToast('복구할 SQL 파일을 선택해주세요.', 'warning');
  }
}

async function restoreDatabase() {
  showRestoreConfirmModal.value = false;
  restoreLoading.value = true;
  restoreMessage.value = '';
  restoreError.value = false;

  if (!selectedRestoreFile.value) {
    restoreMessage.value = '복구할 파일이 선택되지 않았습니다.';
    restoreError.value = true;
    restoreLoading.value = false;
    showToast('파일 선택 필요!', 'warning');
    return;
  }

  const formData = new FormData();
  formData.append('backupFile', selectedRestoreFile.value);

  try {
    const response = await $fetch('/api/admin/db/restore', {
      method: 'POST',
      body: formData,
    });

    if (response.success) {
      restoreMessage.value = response.message;
      restoreError.value = false;
      showToast('DB 복구 성공!', 'success');
      // 복구 후 테이블 데이터 새로고침은 이 페이지에서는 필요 없음.
      // 실제 데이터 새로고침은 사용자가 DB 조회 페이지로 이동할 때 발생.
    } else {
      restoreMessage.value = response.message || '알 수 없는 복구 오류 발생.';
      restoreError.value = true;
      showToast('DB 복구 실패!', 'error');
    }
  } catch (e: any) {
    restoreMessage.value = e.data?.message || 'DB 복구 중 에러가 발생했습니다.';
    restoreError.value = true;
    showToast('DB 복구 에러!', 'error');
    console.error('복구 에러:', e);
  } finally {
    restoreLoading.value = false;
    selectedRestoreFile.value = null; // 파일 선택 초기화
    // input type="file" 초기화
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
</script>

<style scoped>
/* Tailwind CSS가 대부분의 스타일을 처리하므로, 여기서는 특별한 스타일이 필요하지 않을 수 있습니다. */
</style> 