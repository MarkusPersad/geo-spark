<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {ShieldCloseIcon,Layers2Icon} from 'lucide-vue-next'
import {computed, Ref, ref} from "vue";
import {useMediaQuery} from '@vueuse/core'
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Imagery, OSM} from "@/components/cesium";

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

const imagery :Ref<"OSM"|"Imagery"> = ref("Imagery")

const imageryComponent = computed(() => {
  switch (imagery.value) {
    case "Imagery":
      return Imagery
    case "OSM":
      return OSM
  }
})

</script>

<template>
  <Component :is="Modal.Root" v-model:open="open">
    <Component :is="Modal.Trigger">
      <Button variant="outline" size="icon">
        <Layers2Icon />
      </Button>
    </Component>
    <Component :is="Modal.Content" class="sm:max-w-md" :class="[{ 'px-2 pb-8 *:px-4': !isDesktop },]" >
      <Component :is="Modal.Header">
        <Component :is="Modal.Title">
          Imagery
        </Component>
      </Component>
      <div class="flex items-center gap-2">
        <div class="grid flex-1 gap-2">
          <Label for="imagery" class="sr-only">
            Imagery
          </Label>
          <Select v-model="imagery">
            <SelectTrigger>
              <SelectValue placeholder="Imagery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OSM">OSM</SelectItem>
              <SelectItem value="Imagery">Imagery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Component :is="Modal.Footer" class="pt-4">
        <Component :is="Modal.Close" as-child>
          <Button variant="outline" size="icon">
            <ShieldCloseIcon />
          </Button>
        </Component>
      </Component>
    </Component>
  </Component>
  <Component :is="imageryComponent" />
</template>