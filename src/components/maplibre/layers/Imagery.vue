<script setup lang="ts">
import {SourceSpecification} from "maplibre-gl";
import {BaseURL,API} from '@/assets/default.json';
import {inject, onMounted, onUnmounted} from "vue";
import {MaplibreProvider,maplibreProviderSymbol} from "@/components/maplibre";

const mapProvider = inject<MaplibreProvider>(maplibreProviderSymbol)
const createImagerSource = (imageryType:'img_w'|'ibo_w'|'cia_w'):SourceSpecification => {
  return {
    type: 'raster',
    tiles:[
      `${BaseURL}${API.IMAGERY}/0/${imageryType}/{z}/{x}/{y}`,
      `${BaseURL}${API.IMAGERY}/1/${imageryType}/{z}/{x}/{y}`,
      `${BaseURL}${API.IMAGERY}/2/${imageryType}/{z}/{x}/{y}`,
      `${BaseURL}${API.IMAGERY}/3/${imageryType}/{z}/{x}/{y}`,
      `${BaseURL}${API.IMAGERY}/4/${imageryType}/{z}/{x}/{y}`,
      `${BaseURL}${API.IMAGERY}/5/${imageryType}/{z}/{x}/{y}`,
      `${BaseURL}${API.IMAGERY}/6/${imageryType}/{z}/{x}/{y}`,
      `${BaseURL}${API.IMAGERY}/7/${imageryType}/{z}/{x}/{y}`,
    ],
    tileSize: 256,
  }
}
onMounted(() => {
  if (mapProvider?.map){
    mapProvider.map.addSource('img_w',createImagerSource('img_w'))
    mapProvider.map.addSource('ibo_w',createImagerSource('ibo_w'))
    mapProvider.map.addSource('cia_w',createImagerSource('cia_w'))
    mapProvider.map.addLayer({
      id:'img_w',
      type: 'raster',
      source:'img_w',
      minzoom: 0,
      maxzoom: 18
    })
    mapProvider.map.addLayer({
      id:'ibo_w',
      type: 'raster',
      source:'ibo_w',
      minzoom: 0,
      maxzoom: 18
    })
    mapProvider.map.addLayer({
      id:'cia_w',
      type: 'raster',
      source:'cia_w',
      minzoom: 0,
      maxzoom: 18
    })
  }
})
onUnmounted( () =>{
  if (mapProvider?.map){
    mapProvider.map.removeLayer('img_w')
    mapProvider.map.removeLayer('ibo_w')
    mapProvider.map.removeLayer('cia_w')
    mapProvider.map.removeSource('img_w')
    mapProvider.map.removeSource('ibo_w')
    mapProvider.map.removeSource('cia_w')
  }
})
</script>

<template>

</template>