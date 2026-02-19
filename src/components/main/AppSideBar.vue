<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import { SidebarTrigger } from '@/components/ui/sidebar'

import {
  DatabaseZapIcon,
  Map,
} from "lucide-vue-next"
import { NavMain,NavUser } from '@/components/main'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  navMain:[
    {
      title: '地图',
      icon:Map,
      url: '/map'
    },
    {
      title: '数据源管理',
      icon: DatabaseZapIcon,
      url: '/data'
    }
  ]
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NavUser :user="data.user" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
        <SidebarTrigger class="-ml-1" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
