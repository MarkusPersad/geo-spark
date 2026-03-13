<script setup lang="ts">
import { DataTable } from '@/components/data'
import { MapView } from "@/components/maplibre";

</script>
<template>
<div class="min-w-full min-h-full flex flex-col">
  <MapView class="min-w-full h-100"/>
  <DataTable class="grow" />
</div>
</template>