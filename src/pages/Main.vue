<script setup lang="ts">
import { AppSidebar } from '@/components/main'
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import { Toaster } from '@/components/ui/sonner'
import {onMounted} from "vue";
import {setTray} from "@/lib";
import {storeToRefs} from "pinia";
import {useFullScreen} from "@/lib/state";

onMounted(async () => {
  await setTray()
})
const { fullScreen } = storeToRefs(useFullScreen())
</script>

<template>
  <Toaster position="top-center" rich-colors />
  <SidebarProvider>
    <Suspense>
      <AppSidebar v-if="!fullScreen" />
    </Suspense>
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
