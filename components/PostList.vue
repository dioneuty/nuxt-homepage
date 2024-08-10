<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 dark:text-white">
    <h2 :class="[
      'text-xl font-bold p-4 text-white',
      headerColorClass
    ]">
      {{ title }}
    </h2>
    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
      <li v-if="posts.length === 0" class="p-4 text-gray-500 dark:text-gray-400">
        게시물이 없습니다.
      </li>
      <li v-else v-for="post in posts.slice(0, 5)" :key="post.id" class="p-4 hover:bg-gray-50 transition duration-150 ease-in-out dark:hover:bg-gray-700">
        <NuxtLink :to="getPostLink(post)" class="block">
          <h3 class="text-lg font-semibold text-gray-900 mb-1 dark:text-white">{{ post.title }}</h3>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  posts: Array,
  headerColorClass: {
    type: String,
    default: 'bg-blue-600'
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['blog', 'board'].includes(value)
  }
})

const getPostLink = (post) => {
  return props.type === 'blog' ? `/blog/view?id=${post.id}` : `/board/view?id=${post.id}`
}
</script>