<!-- pages/adminpage/users.vue -->
<template>
  <div class="space-y-6">
    <!-- 헤더 -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
        사용자 관리
      </h2>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Icon icon="mdi:plus" class="w-5 h-5" />
        새 사용자 추가
      </button>
    </div>

    <!-- 검색 및 필터 -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 검색 -->
        <div class="md:col-span-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="사용자명 또는 이메일 검색..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            @input="debouncedSearch"
          />
        </div>
        
        <!-- 역할 필터 -->
        <div>
          <select
            v-model="roleFilter"
            @change="loadUsers"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">모든 역할</option>
            <option value="USER">일반 사용자</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>

        <!-- 상태 필터 -->
  <div>
          <select
            v-model="statusFilter"
            @change="loadUsers"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 사용자 테이블 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <Icon icon="mdi:loading" class="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
      </div>
      
      <div v-else-if="error" class="p-8 text-center text-red-600">
        <Icon icon="mdi:alert-circle" class="w-8 h-8 mx-auto mb-2" />
        <p>{{ error }}</p>
        <button @click="loadUsers" class="mt-2 text-blue-600 hover:underline">
          다시 시도
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  @click="sort('id')">
                ID
                <Icon :icon="getSortIcon('id')" class="w-4 h-4 inline ml-1" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  @click="sort('username')">
                사용자명
                <Icon :icon="getSortIcon('username')" class="w-4 h-4 inline ml-1" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  @click="sort('email')">
                이메일
                <Icon :icon="getSortIcon('email')" class="w-4 h-4 inline ml-1" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                역할
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                상태
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  @click="sort('createdAt')">
                가입일
                <Icon :icon="getSortIcon('createdAt')" class="w-4 h-4 inline ml-1" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ user.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ user.username }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user.role)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ user.role === 'ADMIN' ? '관리자' : '일반 사용자' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(user.isActive)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ user.isActive ? '활성' : '비활성' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="openEditModal(user)"
                  class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title="수정"
                >
                  <Icon icon="mdi:pencil" class="w-4 h-4" />
                </button>
                <button
                  @click="openResetPasswordModal(user)"
                  class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                  title="비밀번호 재설정"
                >
                  <Icon icon="mdi:lock-reset" class="w-4 h-4" />
                </button>
                <button
                  @click="toggleUserStatus(user)"
                  :class="user.isActive ? 'text-orange-600 hover:text-orange-800 dark:text-orange-400' : 'text-green-600 hover:text-green-800 dark:text-green-400'"
                  :title="user.isActive ? '비활성화' : '활성화'"
                >
                  <Icon :icon="user.isActive ? 'mdi:account-off' : 'mdi:account-check'" class="w-4 h-4" />
                </button>
                <button
                  @click="openDeleteModal(user)"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="삭제"
                >
                  <Icon icon="mdi:delete" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 데이터가 없을 때 -->
        <div v-if="users.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          <Icon icon="mdi:account-search" class="w-12 h-12 mx-auto mb-2" />
          <p>사용자가 없습니다.</p>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="pagination && pagination.totalPages > 1" class="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            {{ pagination.totalUsers }}명 중 {{ ((pagination.page - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.totalUsers) }}번째 표시
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="!pagination.hasPrev"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span class="px-3 py-1 text-sm">
              {{ pagination.page }} / {{ pagination.totalPages }}
            </span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="!pagination.hasNext"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달들 -->
    <UserCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onUserCreated"
    />

    <UserEditModal
      v-if="showEditModal && selectedUser"
      :user="selectedUser"
      @close="showEditModal = false"
      @updated="onUserUpdated"
    />

    <ResetPasswordModal
      v-if="showResetPasswordModal && selectedUser"
      :user="selectedUser"
      @close="showResetPasswordModal = false"
      @reset="onPasswordReset"
    />

    <DeleteConfirmModal
      v-if="showDeleteModal && selectedUser"
      :user="selectedUser"
      @close="showDeleteModal = false"
      @deleted="onUserDeleted"
    />

    <!-- 토스트 메시지 -->
    <Toast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted, computed } from 'vue'
import { debounce } from 'lodash-es'
import UserCreateModal from '~/components/admin/UserCreateModal.vue'
import UserEditModal from '~/components/admin/UserEditModal.vue'
import ResetPasswordModal from '~/components/admin/ResetPasswordModal.vue'
import DeleteConfirmModal from '~/components/admin/DeleteConfirmModal.vue'
import Toast from '~/components/common/Toast.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: '사용자 관리'
})

// 상태 관리
const users = ref([])
const loading = ref(false)
const error = ref('')
const pagination = ref(null)

// 필터 및 정렬
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const currentPage = ref(1)

// 모달 상태
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showResetPasswordModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)

// 토스트
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 사용자 목록 로드
const loadUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '10',
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (roleFilter.value) params.append('role', roleFilter.value)
    if (statusFilter.value) params.append('status', statusFilter.value)
    
    const data = await $fetch(`/api/admin/users?${params}`)
    users.value = data.users
    pagination.value = data.pagination
  } catch (err) {
    error.value = err.data?.message || '사용자 목록을 불러올 수 없습니다.'
    console.error('사용자 목록 로드 오류:', err)
  } finally {
    loading.value = false
  }
}

// 디바운스된 검색
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadUsers()
}, 500)

// 정렬
const sort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  loadUsers()
}

const getSortIcon = (column) => {
  if (sortBy.value !== column) return 'mdi:unfold-more-horizontal'
  return sortOrder.value === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadUsers()
}

// 유틸리티 함수들
const getRoleBadgeClass = (role) => {
  return role === 'ADMIN' 
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const getStatusBadgeClass = (isActive) => {
  return isActive
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 모달 핸들러들
const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const openResetPasswordModal = (user) => {
  selectedUser.value = user
  showResetPasswordModal.value = true
}

const openDeleteModal = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

// 이벤트 핸들러들
const onUserCreated = (newUser) => {
  showCreateModal.value = false
  showToast('사용자가 성공적으로 생성되었습니다.', 'success')
  loadUsers()
}

const onUserUpdated = (updatedUser) => {
  showEditModal.value = false
  showToast('사용자 정보가 성공적으로 업데이트되었습니다.', 'success')
  loadUsers()
}

const onPasswordReset = () => {
  showResetPasswordModal.value = false
  showToast('비밀번호가 성공적으로 재설정되었습니다.', 'success')
}

const onUserDeleted = () => {
  showDeleteModal.value = false
  showToast('사용자가 성공적으로 삭제되었습니다.', 'success')
  loadUsers()
}

// 사용자 상태 토글
const toggleUserStatus = async (user) => {
  try {
    const response = await $fetch(`/api/admin/users/${user.id}/toggle-status`, {
      method: 'POST'
    })
    showToast(response.message, 'success')
    loadUsers()
  } catch (err) {
    showToast(err.data?.message || '상태 변경에 실패했습니다.', 'error')
  }
}

// 토스트 메시지
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
}

// 컴포넌트 마운트
onMounted(() => {
  loadUsers()
})
</script> 