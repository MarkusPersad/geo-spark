<script setup lang="ts">
import { load } from '@loaders.gl/core';
import {storeToRefs} from "pinia";
import {useGeoSpatialFile} from "@/lib/state";
import { getSchema } from '@/lib'
import { ShapefileLoader } from '@loaders.gl/shapefile'
import {MapboxOverlay} from "@deck.gl/mapbox";
import {GeoJsonLayer} from "@deck.gl/layers";
import {inject, onMounted, onUnmounted} from "vue";
import {MaplibreProvider,maplibreProviderSymbol} from "@/components/maplibre";
import {featureCollection} from "@turf/helpers";

const {geospatialFile} = storeToRefs(useGeoSpatialFile())

const mapProvider = inject<MaplibreProvider>(maplibreProviderSymbol)

const geojson = (await load(`${getSchema()}${geospatialFile.value}`,ShapefileLoader)) as any
console.log(geojson)
const deckOverlay = new MapboxOverlay({
  interleaved: true,
  layers:[
    new GeoJsonLayer({
      id: 'airports',
      data: featureCollection(geojson.data),
      pickable: true,
      autoHighlight: true,
      highlightColor: [0, 255, 0],

      // Visuals
      opacity: 1.0,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      // getElevation: (f) => Math.sqrt(f?.properties?.valuePerSqm) * 10,
      // lines
      getLineColor: [0, 0, 255],
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      // point fills
      getFillColor: [255, 0, 0],
      getPointRadius: 100,
      pointRadiusScale: 500,
    })
  ]
})
onMounted(()=>{
  if (mapProvider?.map){
    mapProvider.map.addControl(deckOverlay)
  }
})
onUnmounted(()=>{
  if (mapProvider?.map){
    mapProvider.map.removeControl(deckOverlay)
    deckOverlay.finalize()
  }
})
</script>
<template></template>