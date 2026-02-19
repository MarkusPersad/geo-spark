<script setup lang="ts">
import { useRoute } from 'vue-router'
import {LucideIcon} from "lucide-vue-next";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";

const route = useRoute()

defineProps<{
  items: {
    title:string,
    url:string,
    icon:LucideIcon,
  }[]
}>()

const isActive = (path:string) => route.path === path

</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem v-for="item in items" :key="item.title">
      <SidebarMenuButton  as-child :is-active="isActive(item.url)" :class="{active:isActive(item.url)}">
        <RouterLink :to="item.url">
          <component :is="item.icon" />
          <span class="ml-2">{{ item.title }}</span>
        </RouterLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<style scoped>
.active {
  background-color: #d3d3d3; /* 灰色背景 */
  color: #333; /* 文字颜色 */
  transition: background-color 0.3s ease, color 0.3s ease; /* 添加过渡效果 */
}
</style>