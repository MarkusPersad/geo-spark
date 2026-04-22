<script setup lang="ts">
import { DatabaseZapIcon, Map } from "lucide-vue-next";
import { useRoute, RouterLink } from 'vue-router';

const route = useRoute();

const isActive = (path: string) => route.path === path;

const items = [
  {
    title: '地图',
    icon: Map,
    url: '/map'
  },
  {
    title: '数据源管理',
    icon: DatabaseZapIcon,
    url: '/data'
  }
];
</script>

<template>
  <nav class="w-full flex items-center justify-between bg-neutral-800 text-neutral-100 p-2">
    <RouterLink
        v-for="item in items"
        :key="item.title"
        :to="item.url"
        :class="[
        'flex-1 mx-1 flex items-center justify-center h-12 rounded-lg border border-transparent whitespace-nowrap transition-colors duration-200',
        isActive(item.url)
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'hover:bg-neutral-700 hover:text-white'
      ]"
    >
      <component :is="item.icon" class="mr-2 w-5 h-5" />
      <span>{{ item.title }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
</style>