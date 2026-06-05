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
import { open } from "@tauri-apps/plugin-dialog"
import { toast } from "vue-sonner"
import { invoke } from "@tauri-apps/api/core"
import { Http } from "@/lib"
import {BaseURL,API} from "@/assets/default.json"

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const { getSettings,updateUser } = useSettings ()

const {getKeys} = storeToRefs(useSources())

const settings = await getSettings()

const user  = ref<{name:string,email:string,avatar:string}>({
  name: settings.User.UserName,
  email: settings.User.Email,
  avatar: settings.User.Avatar|| "https://github.com/shadcn.png",
})

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
const uploadAvatar = async () => {
  try {
    const avatarFile = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "图片",
          extensions:["webp"]
        }
      ]
    })
    if (avatarFile) {
      const avatar = await invoke("get_avatar_base64", { file: avatarFile })
      let res = await Http.useFetch(`${BaseURL}${API.UPLOADAVATAR}`, {
        method: "POST",
        body: JSON.stringify({
          "avatar":avatar
        })
      })
      if (!res.ok) throw new Error("头像上传失败")
      const response = await res.json()
      if (response.code !== 0) throw new Error(response.message)
      updateUser({
        Avatar:avatar as string
      })
      user.value.avatar = avatar as string
    }
  } catch (err: any) {
    toast.error(err.message||String(err))
  }
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NavUser :user="user" @click="uploadAvatar" />
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
