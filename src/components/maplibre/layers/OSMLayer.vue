<script setup lang="ts">
import {MaplibreProvider,maplibreProviderSymbol} from "@/components/maplibre";
import {inject, onMounted, onUnmounted} from "vue";
import {SourceSpecification} from "maplibre-gl";
const maplibreProvider = inject<MaplibreProvider>(maplibreProviderSymbol)
const osmSource : SourceSpecification = {
  type: 'raster',
  tiles: [
    "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
  ],
  tileSize: 256,
  attribution: "&copy; OpenStreetMap Contributors",
  maxzoom: 19,
}
onMounted( () => {
  if (maplibreProvider?.map) {
    maplibreProvider.map?.addSource('osm-tiles',osmSource )
    maplibreProvider.map.addLayer({
      id:'osm',
      type: 'raster',
      source:'osm-tiles',
    })
  }
})
onUnmounted( () =>{
  if (maplibreProvider?.map){
    maplibreProvider.map.removeSource('osm-tiles')
    maplibreProvider.map.removeLayer('osm')
  }
})
</script>

<template>

</template>