<template>
  <div>
    <div class="mb-4">
      <button @click="scrollToItem(4800)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
        4800번째 항목으로 이동
      </button>
      <button @click="scrollToItem(9000)" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
        9000번째 항목으로 이동
      </button>
      <button @click="scrollToItem(0)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        처음으로 이동
      </button>
    </div>
    <div class="virtual-scroll-container" @scroll="handleScroll" ref="containerRef">
      <div class="scroll-content" :style="{ height: totalHeight + 'px' }">
        <TransitionGroup name="list" tag="div">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="list-item"
            :style="{ transform: `translateY(${item.offset}px)` }"
          >
            {{ item.text }}
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue'
  
const containerRef = ref(null)
const itemHeight = 50 // 각 항목의 높이
const visibleItemCount = 10 // 한 번에 보여줄 항목 수
const bufferItemCount = 5 // 위아래로 추가로 렌더링할 항목 수
  
const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  text: `항목 ${i + 1}`,
  offset: i * itemHeight
})))
  
const scrollTop = ref(0)
const totalHeight = computed(() => items.value.length * itemHeight)
  
const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight) - bufferItemCount
  const end = start + visibleItemCount + 2 * bufferItemCount
  return items.value.slice(Math.max(0, start), Math.min(items.value.length, end))
})
  
const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}
  
const scrollToItem = (index) => {
  if (containerRef.value) {
    containerRef.value.scrollTop = index * itemHeight
  }
}
  
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
  }
})
</script>
  
<style scoped>
.virtual-scroll-container {
  height: 400px;
  overflow-y: auto;
  position: relative;
  border: 1px solid #ccc;
}
  
.scroll-content {
  position: relative;
}
  
.list-item {
  height: 50px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  position: absolute;
  left: 0;
  right: 0;
  background-color: white;
}
  
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
  
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>