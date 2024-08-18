<template>
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">{{ modalTitle }}</h2>
          <p class="mb-4 text-gray-700 dark:text-gray-300" v-html="modalContent"></p>
          <div class="flex justify-end space-x-2">
            <button v-if="isConfirm" @click="cancelModal" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              취소
            </button>
            <button @click="confirmModal" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {{ isConfirm ? '확인' : '닫기' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  import { useModal } from '~/composables/useModal'
  
  const { isModalOpen, modalTitle, modalContent, isConfirm, closeModal, confirmModal, cancelModal } = useModal()
  </script>