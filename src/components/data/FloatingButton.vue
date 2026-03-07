<template>
  <!-- 基础浮动按钮 -->
  <Button
      v-if="!expandable"
      class="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      size="icon"
  >
    <Plus class="h-6 w-6" />
  </Button>

  <!-- 向上展开的浮动按钮 -->
  <div
      v-else-if="direction === 'up'"
      class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
  >
    <TransitionGroup name="fab-up">
      <div v-if="isOpen" class="flex flex-col items-end gap-3 mb-2">
        <slot name="up"></slot>
      </div>
    </TransitionGroup>

    <Button
        size="icon"
        class="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        :class="{ 'rotate-45': isOpen }"
        @click="isOpen = !isOpen"
    >
      <Plus class="h-6 w-6 transition-transform duration-300" />
    </Button>
  </div>

  <!-- 向左侧展开的浮动按钮 -->
  <div
      v-else-if="direction === 'left'"
      class="fixed bottom-6 right-6 z-50 flex flex-row-reverse items-center gap-3"
  >
    <Button
        size="icon"
        class="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
        :class="{ 'rotate-45': isOpen }"
        @click="isOpen = !isOpen"
    >
      <Plus class="h-6 w-6 transition-transform duration-300" />
    </Button>

    <TransitionGroup name="fab-left">
      <div v-if="isOpen" class="flex flex-row items-center gap-3">
        <slot name="left"></slot>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

interface Props {
  expandable?: boolean
  direction?: 'up' | 'left'
}

withDefaults(defineProps<Props>(), {
  expandable: true,
  direction: 'up'
})

const isOpen = ref(false)

defineExpose({
  close: () => { isOpen.value = false },
  open: () => { isOpen.value = true },
  toggle: () => { isOpen.value = !isOpen.value }
})
</script>

<style scoped>
/* 向上展开的动画 */
.fab-up-enter-active,
.fab-up-leave-active {
  transition: all 0.3s ease;
}
.fab-up-enter-from,
.fab-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 向左侧展开的动画 */
.fab-left-enter-active,
.fab-left-leave-active {
  transition: all 0.3s ease;
}
.fab-left-enter-from,
.fab-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>