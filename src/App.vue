<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import { onMounted } from 'vue';

onMounted(async () => {
  await getCurrentWindow().setContentProtected(true)
})
</script>
<template>
  <RouterView />
</template>
