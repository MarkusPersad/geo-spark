<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import { SidebarTrigger } from '@/components/ui/sidebar'

import {
  DatabaseZapIcon, LucideIcon,
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
import {useSettings, useSources} from "@/lib/state";
import {storeToRefs} from "pinia";
import {ref, Ref, watch} from "vue";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const { getSettings } = useSettings ()

const {getKeys} = storeToRefs(useSources())

const settings = await getSettings()

const user :{name:string,email:string,avatar:string} = {
  name: settings.User.UserName,
  email: settings.User.Email,
  avatar: settings.User.Avatar|| "https://github.com/shadcn.png",
}

const navMain:Ref<{
  title:string,
  icon:LucideIcon,
  url:string,
  items?:{
    key:string
  }[]
}[]> = ref(
    [
      {
        title: '地图',
        icon:Map,
        url: '/map',
        items:[]
      },
      {
        title: '数据源管理',
        icon: DatabaseZapIcon,
        url: '/data'
      }
    ]
)
watch(()=>getKeys.value,()=>{
  navMain.value[0].items = getKeys.value.map(key=>({key}))
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NavUser :user="user" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="navMain" />
    </SidebarContent>
    <SidebarFooter>
        <SidebarTrigger class="-ml-1" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
