<template>
  <!-- 基础浮动按钮 -->
  <Button
      class="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      size="icon"
  >
    <Plus class="h-6 w-6" />
  </Button>

  <!-- 带展开菜单的浮动按钮 -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <!-- 展开的菜单项 -->
    <TransitionGroup name="fab">
      <div v-if="isOpen" class="flex flex-col items-end gap-3 mb-2">
        <Button
            v-for="action in actions"
            :key="action.name"
            variant="secondary"
            size="sm"
            class="rounded-full shadow-md"
            @click="handleAction(action)"
        >
          <span class="mr-2">{{ action.label }}</span>
          <component :is="action.icon" class="h-4 w-4" />
        </Button>
      </div>
    </TransitionGroup>

    <!-- 主按钮 -->
    <Button
        size="icon"
        class="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        :class="{ 'rotate-45': isOpen }"
        @click="isOpen = !isOpen"
    >
      <Plus class="h-6 w-6 transition-transform duration-300" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import { Button } from '@/components/ui/button'
import {LucideIcon,Plus} from 'lucide-vue-next'

export interface FloatingAction {
  name: string,
  label:string,
  icon: LucideIcon,
  handle: () => void
}

const isOpen = ref(false)

defineProps<{
  actions: FloatingAction[]
}>()

const handleAction = (action: FloatingAction) => {
  action.handle()
  isOpen.value = false
}
</script>

<style scoped>
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s ease;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>