<script setup lang="ts">
import { DatabaseZapIcon, Map } from "lucide-vue-next";
import { useRoute } from 'vue-router';
// 补充 RouterLink 导入（避免运行时报错）
import { RouterLink } from 'vue-router';

const route = useRoute();

const isActive = (path:string) => route.path === path

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
]
</script>

<template>
  <div class="ds-dock ds-dock-xs w-full flex items-center justify-between ds-bg-neutral  ds-text-neutral-content">
    <button
        variant="outline"
        v-for="item in items"
        :key="item.title"
        :class="[isActive(item.url) ? 'ds-dock-active' : '']"
        class="flex-1 mx-1"
    >
    <RouterLink :to="item.url" class="flex items-center justify-center w-full">
      <component :is="item.icon" class="mr-2" />
      <span>{{ item.title }}</span>
    </RouterLink>
    </button>
  </div>
</template>

<style scoped>
@reference "tailwindcss"
/* 激活状态样式（可选，根据你的设计调整） */
.ds-dock-active {
  @apply bg-primary/10 text-primary border-primary/20;
}

/* 确保 dock 容器无额外内边距，按钮完全占满 */
.ds-dock {
  padding: 0.5rem;
}

/* 按钮样式优化，确保点击区域完整 */
:deep(.btn) {
  height: 3rem;
  white-space: nowrap;
}
</style>
