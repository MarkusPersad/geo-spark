<script setup lang="ts">
import { AppSidebar } from '@/components/main'
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import { Toaster } from '@/components/ui/sonner'
import {onMounted} from "vue";
import {setTray} from "@/lib";

onMounted(async () => {
  await setTray()
})

</script>

<template>
  <Toaster position="top-center" rich-colors />
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <div class="flex flex-1  p-0">
        <RouterView v-slot="{ Component }">
          <KeepAlive include="CesiumShow">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
