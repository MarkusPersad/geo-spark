<script setup lang="ts">
import { useRoute } from 'vue-router'
import {LucideIcon} from "lucide-vue-next";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Button} from "@/components/ui/button";
import {XIcon} from 'lucide-vue-next';
import {Separator} from "@/components/ui/separator";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Label} from "@/components/ui/label";

const route = useRoute()

defineProps<{
  items: {
    title:string,
    url:string,
    icon:LucideIcon,
    items?:{
      key:string,
    }[]
  }[]
}>()

const isActive = (path:string) => route.path === path

</script>

<template>
  <SidebarMenu>
    <Collapsible v-for="item in items" :key="item.title" as-child :default-open="isActive(item.url)" class="group/collasible">
      <SidebarMenuItem>
        <CollapsibleTrigger as-child>
          <SidebarMenuButton  as-child :is-active="isActive(item.url)" :class="{active:isActive(item.url)}">
            <RouterLink :to="item.url">
              <component :is="item.icon" />
              <span class="ml-2">{{ item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub v-show="item.items?.length">
            <ScrollArea class="max-h-72 rounded-md border">
              <SidebarMenuSubItem v-for="sub in item.items" :key="sub.key">
                <template class="flex items-center justify-between w-full">
                  <SidebarMenuSubButton as-child class="grow justify-start min-w-0">
                    <RouterLink :to="`${item.url}/${sub.key}`">
                      <Label class="ml-2 font-normal truncate text-left w-full">{{sub.key}}</Label>
                    </RouterLink>
                  </SidebarMenuSubButton>
                  <Button variant="outline" size="icon-sm" class="shrink-0 h-8 w-8">
                    <RouterLink :to="`${item.url}/${sub.key}/true`">
                      <XIcon />
                    </RouterLink>
                  </Button>
                </template>
                <Separator />
              </SidebarMenuSubItem>
            </ScrollArea>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  </SidebarMenu>
</template>

<style scoped>
.active {
  background-color: #d3d3d3; /* 灰色背景 */
  color: #333; /* 文字颜色 */
  transition: background-color 0.3s ease, color 0.3s ease; /* 添加过渡效果 */
}
</style>