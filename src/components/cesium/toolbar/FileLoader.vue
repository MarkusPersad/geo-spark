<script setup lang="ts">
import {useMediaQuery} from "@vueuse/core";
import {computed, inject, ref} from "vue";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Drawer, DrawerClose,
  DrawerContent,
  DrawerDescription, DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {FoldersIcon} from "lucide-vue-next";
import {Input} from "@/components/ui/input";
import {storeToRefs} from "pinia";
import {useGeoSpatialFile} from "@/lib/state";
import {Field} from "@/components/ui/field";
import {open as openFile} from '@tauri-apps/plugin-dialog';
import {toast} from "vue-sonner";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {LoadCzml, LoadGeoJSON, LoadShapefile, LoadTileJSON} from "@/lib";

const isDesktop = useMediaQuery('(min-width: 640px)')

const Modal = computed(() => ({
  Root: isDesktop.value ? Dialog : Drawer,
  Trigger: isDesktop.value ? DialogTrigger : DrawerTrigger,
  Content: isDesktop.value ? DialogContent : DrawerContent,
  Header: isDesktop.value ? DialogHeader : DrawerHeader,
  Title: isDesktop.value ? DialogTitle : DrawerTitle,
  Description: isDesktop.value ? DialogDescription : DrawerDescription,
  Footer: isDesktop.value ? DialogFooter : DrawerFooter,
  Close: isDesktop.value ? DialogClose : DrawerClose,
}))

const open = ref(false)


const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)

const { geospatialFile } = storeToRefs(useGeoSpatialFile())

const selectGeoSpatialFile = async () =>{
  try {
    const file = await openFile({
      multiple:false,
      directory:false,
      filters:[
        {
          name:"Shapefile",
          extensions:['shp']
        },
        {
          name:"GeoJSON",
          extensions:['geojson','json']
        },
        {
          name:"3DTiles",
          extensions: ['json']
        },
        {
          name:"CZML",
          extensions: ['czml']
        }
      ]
    })
    if (file){
      geospatialFile.value = file.replace(/\\/g, "/");
    }
  } catch (err:any) {
    toast.error(err.message || String(err))
  }
}
const load = async () => {
  try {
    if (cesiumProvider?.viewer) {
      if (geospatialFile.value.endsWith('tileset.json')){
        await LoadTileJSON(geospatialFile.value, cesiumProvider.viewer)
      }
      else if (geospatialFile.value.endsWith('shp')){
        await LoadShapefile(geospatialFile.value, cesiumProvider.viewer)
      }
      else if (geospatialFile.value.endsWith('czml')) {
        await LoadCzml(geospatialFile.value, cesiumProvider.viewer)
      }
       else if (geospatialFile.value.endsWith('.geojson')|| geospatialFile.value.endsWith('.json')) {
        await LoadGeoJSON(geospatialFile.value, cesiumProvider.viewer)
      }
    }
  } catch (err:any) {
    toast.error(err.message || String(err))
  }
}
const reset = () =>{
  if (cesiumProvider?.viewer){
    cesiumProvider.viewer.dataSources.removeAll()
    cesiumProvider.viewer.scene.primitives.removeAll()
    cesiumProvider.viewer.clock.shouldAnimate = false
    geospatialFile.value = ''
  }
}

</script>

<template>
  <Component :is="Modal.Root" v-model:open="open">
    <Component :is="Modal.Trigger">
      <Button variant="outline" size="icon">
        <FoldersIcon />
      </Button>
    </Component>
    <Component :is="Modal.Content" class="sm:max-w-md" :class="[{ 'px-2 pb-8 *:px-4': !isDesktop },]" >
      <Component :is="Modal.Header">
        <Component :is="Modal.Title">
          GeoSpatial Data Loader
        </Component>
      </Component>
      <div class="flex items-center gap-2">
        <div class="grid flex-1 gap-2">
          <Field orientation="horizontal">
            <Input type="text" placeholder="请选择文件" disabled  v-model="geospatialFile"/>
            <Button variant="outline" @click="selectGeoSpatialFile">
              选择文件
            </Button>
          </Field>
        </div>
      </div>
      <Component :is="Modal.Footer" class="pt-4">
        <Button variant="outline" @click="reset">
          清除数据
        </Button>
        <Component :is="Modal.Close" as-child>
          <Button @click="load">
            加载数据
          </Button>
        </Component>
      </Component>
    </Component>
  </Component>
</template>