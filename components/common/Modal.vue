<template>
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay">
        <div class="card-padded shadow-xl">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">{{ modalTitle }}</h2>
          <p class="mb-4 text-gray-700 dark:text-gray-300" v-html="modalContent"></p>
          <div class="flex justify-end space-x-2">
            <button v-if="isConfirm" @click="cancelModal" class="btn-danger">
              취소
            </button>
            <button @click="confirmModal" class="btn-primary">
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