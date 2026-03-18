<script setup lang="ts">
import {DataTable, FloatingButton} from '@/components/data'
import {MapView,DeckLayer} from "@/components/maplibre";
import {storeToRefs} from "pinia";
import {useGeoSpatialFile} from "@/lib/state";
import Imagery from "@/components/maplibre/layers/Imagery.vue";

const { geospatialFile } = storeToRefs(useGeoSpatialFile())

</script>
<template>
<div class="min-w-full min-h-full flex flex-col">
  <MapView class="min-w-full h-150">
    <Imagery />
    <Suspense>
      <DeckLayer v-if="geospatialFile.endsWith('.shp')" />
    </Suspense>
    <FloatingButton class="opacity-50">

    </FloatingButton>
  </MapView>
  <DataTable class="grow" />
</div>
</template>