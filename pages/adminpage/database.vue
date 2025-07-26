<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-md flex flex-col dark:bg-gray-800 dark:shadow-none dark:border-r dark:border-gray-700">
      <div class="p-4 font-bold border-b dark:border-gray-700 dark:text-white">DB Models</div>
      <ul class="overflow-y-auto">
        <li
          v-for="model in models"
          :key="model.name"
          @click="selectModel(model.name)"
          class="p-4 cursor-pointer hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          :class="{ 'bg-blue-500 text-white dark:bg-blue-600': selectedModel === model.name }"
        >
          {{ model.name }}
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8 overflow-y-auto">
      <div v-if="!selectedModel" class="text-gray-500 flex items-center justify-center h-full dark:text-gray-400">
        Select a model from the sidebar to view its data.
      </div>

      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold dark:text-white">
            {{ selectedModel }}
          </h1>
          <button @click="openAddModal" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Add New
          </button>
        </div>
        
        <div class="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg text-blue-800 dark:text-gray-300 border-l-4 border-blue-500 dark:border-gray-500">
          <h4 class="font-semibold mb-2">데이터베이스 관리 사용 방법:</h4>
          <ul class="list-disc list-inside text-sm space-y-1">
            <li><b>모델 선택:</b> 왼쪽 사이드바에서 조회하고자 하는 데이터베이스 모델(예: `User`, `BlogPost`)을 클릭합니다.</li>
            <li><b>데이터 조회:</b> 선택된 모델의 모든 레코드가 테이블 형태로 표시됩니다.</li>
            <li><b>새 레코드 추가:</b> 상단의 "Add New" 버튼을 클릭하여 새 레코드를 생성할 수 있습니다. 각 필드의 타입에 맞춰 값을 입력하세요.</li>
            <li><b>레코드 수정:</b> 각 레코드 옆의 "Edit" 버튼을 클릭하여 선택된 레코드의 내용을 수정할 수 있습니다.</li>
            <li><b>레코드 삭제:</b> 각 레코드 옆의 "Delete" 버튼을 클릭하여 선택된 레코드를 삭제할 수 있습니다. (주의: 삭제된 데이터는 복구할 수 없습니다.)</li>
            <li><b>데이터 타입:</b> `String`, `Int`, `Boolean`, `DateTime`, `Json` 등 다양한 데이터 타입이 지원됩니다. `Json` 타입은 JSON 형식으로 입력해야 합니다.</li>
          </ul>
        </div>
        
        <div v-if="records.length > 0" class="bg-white shadow-md rounded overflow-x-auto dark:bg-gray-800 dark:shadow-none dark:border dark:border-gray-700">
          <table class="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                <th v-for="key in Object.keys(records[0])" :key="key" class="py-2 px-4 border-b dark:border-gray-700 dark:text-gray-300">
                  {{ key }}
                </th>
                <th class="py-2 px-4 border-b dark:border-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td v-for="(value, key) in record" :key="key" class="py-2 px-4 whitespace-nowrap dark:text-gray-200">
                  {{ truncate(value) }}
                </td>
                <td class="py-2 px-4 flex gap-2">
                  <button @click="editRecord(record)" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                  <button @click="deleteRecord(record.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-gray-500 mt-4 dark:text-gray-400">
          No records found for this model.
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-xl w-1/3 max-h-full overflow-y-auto dark:bg-gray-800 dark:shadow-none dark:border dark:border-gray-700">
        <h2 class="text-xl font-bold mb-4 dark:text-white">{{ editingRecord ? 'Edit' : 'Add' }} Record</h2>
        <div v-if="formFields" class="space-y-4">
          <div v-for="field in formFields" :key="field.name">
            <template v-if="field.kind !== 'object'">
              <label :for="field.name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ field.name }} 
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ field.type }}</span>
                <span v-if="field.isRequired" class="text-red-500">*</span>
              </label>
              <input 
                v-if="['String', 'Int', 'BigInt', 'Float', 'Decimal'].includes(field.type)"
                :type="['Int', 'BigInt', 'Float', 'Decimal'].includes(field.type) ? 'number' : 'text'"
                v-model="formData[field.name]" 
                :disabled="field.isId && editingRecord"
                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
              <input
                v-else-if="field.type === 'DateTime'"
                type="datetime-local"
                :value="formatDateTime(formData[field.name])"
                @input="(event) => handleDateTimeInput(field.name, event)"
                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
              <input
                v-else-if="field.type === 'Boolean'"
                type="checkbox"
                v-model="formData[field.name]"
                class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              >
              <textarea
                v-else-if="field.type === 'Json'"
                v-model="formData[field.name]"
                class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
              ></textarea>
            </template>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-4">
          <button @click="cancelEdit" class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
          <button @click="saveRecord" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Save</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { formatDateTime } from '~/utils/dateFormatter';
import { showConfirm } from '~/composables/useModal';

type ModelField = {
  name: string;
  type: string;
  isId: boolean;
  isRequired: boolean;
  kind: string;
};

type Model = {
  name: string;
  fields: ModelField[];
}

definePageMeta({
  layout: 'admin',
});

const models = ref<Model[]>([]);
const selectedModel = ref<string | null>(null);
const records = ref<any[]>([]);
const showModal = ref(false);
const editingRecord = ref<any | null>(null);
const formData = ref<any>({});


onMounted(async () => {
  try {
    const response = await $fetch<{ models: Model[] }>('/api/admin/db/models');
    models.value = response.models;
  } catch (error) {
    console.error('Error fetching models:', error);
  }
});

const formFields = computed<ModelField[] | null>(() => {
  if (!selectedModel.value) return null;
  const model = models.value.find(m => m.name === selectedModel.value);
  return model ? model.fields : null;
});

const selectModel = async (model: string) => {
  selectedModel.value = model;
  editingRecord.value = null;
  showModal.value = false;
  await fetchRecords(model);
};

const fetchRecords = async (model: string) => {
   try {
    const response = await $fetch<any[]>(`/api/admin/db/${model}`);
    records.value = response;
  } catch (error) {
    console.error(`Error fetching records for ${model}:`, error);
    records.value = [];
  }
}

const openAddModal = () => {
  formData.value = {};
  editingRecord.value = null;
  showModal.value = true;
}

const editRecord = (record: any) => {
  editingRecord.value = { ...record };
  formData.value = { ...record };

  // Handle JSON and DateTime for editing
  if (formFields.value) {
    formFields.value.forEach(field => {
      if (field.type === 'Json' && typeof formData.value[field.name] === 'object' && formData.value[field.name] !== null) {
        formData.value[field.name] = JSON.stringify(formData.value[field.name], null, 2);
      }
    });
  }

  showModal.value = true;
};

const deleteRecord = async (id: number) => {
  if (!selectedModel.value) return;
  
  const confirmDelete = await showConfirm(
    'Delete Record',
    'Are you sure you want to delete this record?'
  );
  
  if (!confirmDelete) return;

  try {
    await $fetch(`/api/admin/db/${selectedModel.value}/${id}`, {
      method: 'DELETE',
    });
    await fetchRecords(selectedModel.value);
  } catch (error) {
    console.error('Error deleting record:', error);
    alert('Failed to delete record.');
  }
};

const cancelEdit = () => {
  editingRecord.value = null;
  showModal.value = false;
  formData.value = {};
};

const saveRecord = async () => {
  if (!selectedModel.value || !formFields.value) return

  const url = editingRecord.value
    ? `/api/admin/db/${selectedModel.value}/${editingRecord.value.id}`
    : `/api/admin/db/${selectedModel.value}`
  
  const dataToSave = { ...formData.value }

  // 데이터 타입 변환
  formFields.value.forEach(field => {
    const value = dataToSave[field.name]
    if (!value) {
      delete dataToSave[field.name]
      return
    }

    const typeMap = {
      Int: Number, Float: Number, Decimal: Number,
      BigInt: v => BigInt(v).toString(),
      DateTime: v => new Date(v).toISOString(),
      Json: v => {
        try { return JSON.parse(v) }
        catch { alert(`Invalid JSON in field: ${field.name}`); throw new Error('Invalid JSON') }
      }
    }

    if (typeMap[field.type]) {
      dataToSave[field.name] = typeMap[field.type](value)
    }
  })

  try {
    await $fetch(url, {
      method: editingRecord.value ? 'PUT' : 'POST',
      body: dataToSave
    })
    await fetchRecords(selectedModel.value)
    cancelEdit()
  } catch (error) {
    console.error('Error saving record:', error)
    alert('Failed to save record.')
  }
}

const handleDateTimeInput = (fieldName: string, event: Event) => {
  if (event.target instanceof HTMLInputElement) {
    formData.value[fieldName] = event.target.value;
  }
};

const truncate = (value: any) => {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value).substring(0, 50) + '...';
  }
  const str = String(value);
  if (str.length > 50) {
    return str.substring(0, 50) + '...';
  }
  return str;
};


</script> 