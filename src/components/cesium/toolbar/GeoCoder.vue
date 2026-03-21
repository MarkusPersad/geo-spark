<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {SearchIcon} from 'lucide-vue-next'
import {computed, inject, Ref, ref} from "vue";
import { BaseURL,API } from '@/assets/default.json'
import {Http} from "@/lib";
import {toast} from "vue-sonner";
import {CesiumProvider,cesiumProviderSymbol} from "@/components/cesium";
import {useMediaQuery} from '@vueuse/core'
import {Cartesian3} from "cesium";
import {
  Dialog,
  DialogClose,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {
  Drawer, DrawerClose,
  DrawerContent,
  DrawerDescription, DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";

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

const searchText:Ref<string> = ref('北京市天安门')

const search = async () =>{
  try {
    if (cesiumProvider?.viewer){
      let url = `${BaseURL}${API.GEOCODER}`
      let res = await Http.useFetch(url,{
        method:'POST',
        body:JSON.stringify({
          "keyword":searchText.value
        })
      })
      let response = await res.json()
      if (!res.ok || (response.code && response.code !== 0)){
        throw new Error(response.message)
      }
      if (response.status && response.status !== "0"){
        throw new Error(response.msg)
      }
      cesiumProvider.viewer.camera.flyTo({
        destination:Cartesian3.fromDegrees(parseFloat(response.location.lon as string),parseFloat(response.location.lat as string),1000)
      })
    }
  }catch (err:any) {
   toast.error(err.message||String(err))
  } finally {
    searchText.value = ''
  }
}
</script>

<template>
    <Component :is="Modal.Root" v-model:open="open">
      <Component :is="Modal.Trigger">
        <Button variant="outline" size="icon">
          <SearchIcon />
        </Button>
      </Component>
        <Component :is="Modal.Content" class="sm:max-w-md" :class="[{ 'px-2 pb-8 *:px-4': !isDesktop },]" >
          <Component :is="Modal.Header">
            <Component :is="Modal.Title">
              GeoCoder
            </Component>
            <Component :is="Modal.Description">
              输入地址，搜索
            </Component>
          </Component>
          <div class="flex items-center gap-2">
            <div class="grid flex-1 gap-2">
              <Label for="location" class="sr-only">
                Location
              </Label>
              <Input
                  id="location"
                  read-only
                  v-model="searchText"
              />
            </div>
          </div>
          <Component :is="Modal.Footer" class="pt-4">
            <Component :is="Modal.Close" as-child>
              <Button variant="outline" size="icon" @click="search">
                <SearchIcon />
              </Button>
            </Component>
          </Component>
        </Component>
    </Component>
</template>