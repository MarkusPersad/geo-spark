<script setup lang="ts">
import { AppSidebar, MobileDock } from '@/components/main'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from '@/components/ui/sonner'
import { onMounted } from "vue"
import { setTray } from "@/lib"
import { storeToRefs } from "pinia"
import { useFullScreen } from "@/lib/state"
import { useMediaQuery } from "@vueuse/core"
import { RouterView} from 'vue-router'

onMounted(async () => {
  await setTray()
})

const { fullScreen } = storeToRefs(useFullScreen())
const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<template>
  <Toaster position="top-center" rich-colors />
  <div class="h-screen w-screen overflow-hidden flex flex-col">
    <SidebarProvider v-if="isDesktop" class="flex-1 h-full w-full">
      <Suspense>
        <AppSidebar v-if="!fullScreen" />
      </Suspense>
      <SidebarInset class="h-full w-full">
        <div class="flex flex-col flex-1 h-full w-full p-0">
          <RouterView v-slot="{ Component }" class="flex-1 h-full w-full">
            <KeepAlive include="CesiumShow">
              <component :is="Component" class="h-full w-full" />
            </KeepAlive>
          </RouterView>
        </div>
      </SidebarInset>
    </SidebarProvider>
    <div v-else class="flex-1 h-full w-full flex flex-col">
      <RouterView v-slot="{ Component }" class="flex-1 h-full w-full overflow-hidden">
        <KeepAlive include="CesiumShow">
          <component :is="Component" class="h-full w-full" />
        </KeepAlive>
      </RouterView>
      <MobileDock
          v-if="!fullScreen"
          class="w-full py-2 px-4 bg-white/90 backdrop-blur-sm border-t border-gray-200"
      />
    </div>
  </div>
</template>
<style>
html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  height: 100%;
  width: 100%;
}
</style>

<style scoped>
/* MobileDock 内部样式优化 */
:deep(.mobile-dock) {
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
}
</style>
