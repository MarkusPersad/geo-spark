<template>
  <!-- 基础浮动按钮（非展开模式） -->
  <Button
      v-if="!expandable"
      class="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      size="icon"
  >
    <Plus class="h-6 w-6" />
  </Button>

  <!-- 展开模式 -->
  <div v-else class="fixed bottom-14 right-6 z-50">
    <!-- 上方按钮组 -->
    <div v-if="$slots.up" class="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-3">
      <Transition name="fab-up">
        <div v-show="isOpen" class="flex flex-col items-end gap-3">
          <slot name="up" />
        </div>
      </Transition>
    </div>

    <!-- 左侧按钮组 -->
    <div v-if="$slots.left" class="absolute right-full bottom-0 mr-3 flex flex-row-reverse items-center gap-3">
      <Transition name="fab-left">
        <div v-show="isOpen" class="flex flex-row-reverse items-center gap-3">
          <slot name="left" />
        </div>
      </Transition>
    </div>

    <!-- 主按钮 -->
    <Button
        size="icon"
        class="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative"
        :class="{ 'rotate-45': isOpen }"
        @click="isOpen = !isOpen"
    >
      <Plus class="h-6 w-6 transition-transform duration-300" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

interface Props {
  expandable?: boolean
}

withDefaults(defineProps<Props>(), {
  expandable: true
})

const isOpen = ref(false)

defineExpose({
  close: () => { isOpen.value = false },
  open: () => { isOpen.value = true },
  toggle: () => { isOpen.value = !isOpen.value }
})
</script>

<style scoped>
/* 向上展开动画 */
.fab-up-enter-active,
.fab-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-up-enter-from,
.fab-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

/* 向左展开动画 */
.fab-left-enter-active,
.fab-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-left-enter-from,
.fab-left-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.9);
}

/* 交错动画延迟 - 通过 CSS 变量或 nth-child 实现 */
.fab-up-enter-active > :nth-child(1),
.fab-left-enter-active > :nth-child(1) { transition-delay: 0ms; }

.fab-up-enter-active > :nth-child(2),
.fab-left-enter-active > :nth-child(2) { transition-delay: 50ms; }

.fab-up-enter-active > :nth-child(3),
.fab-left-enter-active > :nth-child(3) { transition-delay: 100ms; }

.fab-up-enter-active > :nth-child(4),
.fab-left-enter-active > :nth-child(4) { transition-delay: 150ms; }
</style>