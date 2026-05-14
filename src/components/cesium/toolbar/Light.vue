<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { LightbulbIcon, LightbulbOffIcon } from 'lucide-vue-next';
import { inject, ref, watch } from 'vue';
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium';

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const viewer = cesiumProvider?.viewer!
const isShining = ref<boolean>(false)



watch(() => isShining.value, (value) => {
  viewer.scene.globe.enableLighting = value
  viewer.shadows = value
}, { immediate: true })

</script>
<template>
  <Button variant="outline" size="icon" @click="isShining = !isShining">
    <LightbulbIcon v-if="isShining" color="#f6d32d" />
    <LightbulbOffIcon v-else />
  </Button>
</template>
