<script setup lang="ts">
import { DataTable } from '@/components/data'
import {MapView,DeckLayer} from "@/components/maplibre";
import {storeToRefs} from "pinia";
import {useGeoSpatialFile} from "@/lib/state";
import Imagery from "@/components/maplibre/layers/Imagery.vue";

const { geospatialFile } = storeToRefs(useGeoSpatialFile())

</script>
<template>
<div class="min-w-full min-h-full flex flex-col">
  <MapView class="min-w-full h-100">
    <Imagery />
    <Suspense>
      <DeckLayer v-if="geospatialFile.endsWith('.shp')" />
    </Suspense>
  </MapView>
  <DataTable class="grow" />
</div>
</template>