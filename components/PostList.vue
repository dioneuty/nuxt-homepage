<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <h2 :class="[
      'text-xl font-bold p-4 text-white',
      headerColorClass
    ]">
      {{ title }}
    </h2>
    <ul class="divide-y divide-gray-200">
      <li v-for="post in posts" :key="post.id" class="p-4 hover:bg-gray-50 transition duration-150 ease-in-out">
        <NuxtLink :to="getPostLink(post)" class="block">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ post.title }}</h3>
          <p class="text-sm text-gray-500">{{ post.excerpt }}</p>
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
  return props.type === 'blog' ? `/blog/${post.id}` : `/board/${post.id}`
}
</script>