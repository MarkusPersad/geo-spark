<script setup lang="ts">
import {inject, onMounted, onUnmounted} from "vue";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {UrlTemplateImageryProvider} from "cesium";

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const osmMap = new UrlTemplateImageryProvider({
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  subdomains: ["a", "b", "c","d"],
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