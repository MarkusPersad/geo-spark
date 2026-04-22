<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-vue-next';
import { computed, inject, nextTick, ref } from 'vue';
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useMediaQuery } from '@vueuse/core';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import html2canvas from 'html2canvas-pro';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from "@/components/ui/number-field";
import { Label } from "@/components/ui/label";
import { storeToRefs } from "pinia";
import { useCapture } from "@/lib/state";
import { toast } from "vue-sonner";
import { BaseDirectory, exists, remove, writeFile } from "@tauri-apps/plugin-fs";
import { Input } from '@/components/ui/input';

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const viewer = cesiumProvider?.viewer!


const isDesktop = useMediaQuery('(min-width:640px)')
const open = ref<boolean>(false)

const Modal = computed(() => ({
  Root: isDesktop.value ? Dialog : Drawer,
  Trigger: isDesktop.value ? DialogTrigger : DrawerTrigger,
  Content: isDesktop.value ? DialogContent : DrawerContent,
  Header: isDesktop.value ? DialogHeader : DrawerHeader,
  Title: isDesktop.value ? DialogTitle : DrawerTitle,
  Description: isDesktop.value ? DialogDescription : DrawerDescription,
  Footer: isDesktop.value ? DialogFooter : DrawerFooter,
  Close: isDesktop.value ? DialogClose : DrawerClose
}))


const scale = ref<number>(1.0)
const { capture } = storeToRefs(useCapture())
const fileName = ref<string>("export")
const exportImage = async () => {
  if (await exists('export.png', {
    baseDir: BaseDirectory.Download,
  })) {
    await remove('export.png', { baseDir: BaseDirectory.Download })
  }
  try {
    capture.value = true
    await nextTick(async () => {
      const canvas = await html2canvas(viewer.container as HTMLElement, {
        scale: scale.value,
        logging: false,
      })
      canvas.toBlob(async (blob) => {
        if (blob) {
          const reader = blob.stream()
          await writeFile(`${fileName.value}.png`, reader, {
            createNew: true,
            create: true,
            baseDir: BaseDirectory.Download,
            append: false,
          })
        }
      }, 'image/png', 1)
    })
  } catch (err: any) {
    toast.error(err.message || String(err))
  } finally {
    capture.value = false
    reset()
  }
}
const reset = () => {
  scale.value = 1.0
}

</script>
<template>
  <component :is="Modal.Root" v-model:open="open">
    <component :is="Modal.Trigger">
      <Button variant="outline" size="icon">
        <ImageIcon />
      </Button>
    </component>
    <component :is="Modal.Content" class="sm:max-w-md" :class="[{ 'px-2 pb-8 *:px-4': !isDesktop },]">
      <component :is="Modal.Header">
        <component :is="Modal.Title">导出为图片</component>
        <component :is="Modal.Description">
          请对导出的图片进行设置
        </component>
      </component>
      <FieldGroup>
        <FieldSet>
          <FieldLegend></FieldLegend>
          <FieldDescription></FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel for="file-name">图片名称</FieldLabel>
              <Input type="text" placeholder="请输入文件名" id="file-name" v-model="fileName" />
            </Field>
            <NumberField id="scale" :min="0.0" :max="1.0" :format-options="{
              signDisplay: 'exceptZero',
              minimumFractionDigits: 1,
            }" :step="0.1" v-model="scale">
              <Label for="scale">Scale</Label>
              <NumberFieldContent>
                <NumberFieldIncrement />
                <NumberFieldInput />
                <NumberFieldDecrement />
              </NumberFieldContent>
            </NumberField>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
      <component :is="Modal.Footer" class="pt-4">
        <Button variant="outline" @click="reset">
          清除数据
        </Button>
        <component :is="Modal.Close" as-child>
          <Button @click="exportImage">
            导出图片
          </Button>
        </component>
      </component>
    </component>
  </component>
</template>
