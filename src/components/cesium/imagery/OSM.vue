<script setup lang="ts">
import {inject, onMounted, onUnmounted} from "vue";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {OpenStreetMapImageryProvider} from "cesium";

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const osmMap = new OpenStreetMapImageryProvider({
    url: "https://tile.openstreetmap.org/"
})
onMounted(() => {
  cesiumProvider?.viewer?.imageryLayers.addImageryProvider(osmMap)
})
onUnmounted(() => {
  cesiumProvider?.viewer?.imageryLayers.removeAll()
})
</script>

<template>

</template>

<style scoped>

</style>