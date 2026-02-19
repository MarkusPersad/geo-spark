<script setup lang="ts">
import { DataTable,FloatingButton,FloatingAction } from '@/components/data'
import {FileSearch2, LucideIcon} from "lucide-vue-next";
import {ref, Ref} from "vue";
import { open } from '@tauri-apps/plugin-dialog'
import {toast} from "vue-sonner";
import {invoke} from "@tauri-apps/api/core";

const JsonUrl:Ref<string> = ref("")

const selectGISFile = async () => {
  try {
    const gisFile = await open({
      directory: false,
      multiple: false,
      filters: [
        {
          name: '地理文件',
          extensions: ['json', 'geojson', 'kml', 'gml', 'gpx', 'shp']
        }
      ]
    })
    if (gisFile?.endsWith('.shp')){
      await invoke("convert_shapefile_to_geojson",{
        input_path: gisFile!,
        output_path: gisFile!.replace(/\.shp$/, '.geojson')
      })
      JsonUrl.value = gisFile!.replace(/\.shp$/, '.geojson')
    }
    JsonUrl.value = gisFile!
  } catch (err:any) {
    toast.error(err.message || String(err))
  }
}

const actions:FloatingAction[] = [
  {
    name: 'FileSelect',
    label: '文件选择',
    icon: FileSearch2 as LucideIcon,
    handle: () => selectGISFile()
  }
]

</script>
<template>
<div class="min-w-full min-h-full flex flex-col">
  <DataTable class="grow" />
  <FloatingButton :actions="actions" />
</div>
</template>