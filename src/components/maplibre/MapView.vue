<script setup lang="ts">
import "maplibre-gl/dist/maplibre-gl.css";
import { ref, Ref, useTemplateRef, provide, onMounted } from 'vue';
import { InitMap, MaplibreProvider,maplibreProviderSymbol } from '@/components/maplibre';
import { toast } from 'vue-sonner';

const isReady: Ref<boolean> = ref(false)
const mapContainer = useTemplateRef('mapContainer')
const mapProvider: MaplibreProvider = { map: null } 
provide(maplibreProviderSymbol, mapProvider)

onMounted(() => {
  try{
    InitMap(mapContainer, mapProvider, isReady)
  } catch(err:any) {
    toast.error(err.message || String(err))
  }
})
</script>
<template>
  <div ref="mapContainer">
      <slot v-if="isReady"></slot>
  </div>
</template>