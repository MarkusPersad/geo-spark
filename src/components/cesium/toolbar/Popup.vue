<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium';
import {
  Billboard,
  Cartesian2,
  Cartesian3,
  Entity,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  BillboardCollection,
  DistanceDisplayCondition,
} from 'cesium';
import { storeToRefs } from 'pinia';
import { useSources } from '@/lib/state';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-vue-next';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import GeoJsonPrimitiveLayer from '@cesium-extends/primitive-geojson';

type PopupProperty = Record<string, string>

const viewer: Viewer = inject<CesiumProvider>(cesiumProviderSymbol)?.viewer!

const position = ref<Cartesian3>(Cartesian3.ZERO)
const screenPosition = ref<Cartesian2>(Cartesian2.ZERO)
const property = ref<PopupProperty>({})
const popupShow = ref<boolean>(false)
const { sourceList } = storeToRefs(useSources())

const billboardCollection = new BillboardCollection()
viewer.scene.primitives.add(billboardCollection)

let selected: any
let billBoard: Billboard | null = null

let handler: ScreenSpaceEventHandler

const updatePopupPosition = () => {
  if (!Object.keys(property.value).length) return
  // 修复：更稳定的坐标转换
  const cartesian2 = Cartesian2.clone(viewer.scene.cartesianToCanvasCoordinates(position.value)!);
  if (!cartesian2) return
  screenPosition.value = cartesian2
  const cameraPos = viewer.camera.position
  const ellipsoid = viewer.scene.globe.ellipsoid
  const cameraHeight = ellipsoid.cartesianToCartographic(cameraPos).height
  const maxDistance = ellipsoid.maximumRadius + cameraHeight
  const isInviewDistance = Cartesian3.distance(cameraPos, position.value) < maxDistance
  const isInViewHeight = cameraHeight < 5000000
  popupShow.value = isInviewDistance && isInViewHeight
}

const pickFeature = (clickPosition: Cartesian2) => {
  const pickedObject = viewer.scene.pick(clickPosition)
  if (!pickedObject?.id) {
    closePopup()
    return
  }
  if (selected === pickedObject) return
  selected = pickedObject
  const ray = viewer.camera.getPickRay(clickPosition)
  if (!ray) return
  const pickedPosition = viewer.scene.globe.pick(ray, viewer.scene)
  if (pickedPosition) position.value = pickedPosition
  if (pickedObject.id instanceof Entity) {
    const entity = pickedObject.id as Entity
    if (entity.properties) {
      property.value = entity.properties.getValue(viewer.clock.currentTime) || {}
    }
    return
  }
  let found = false;
  for (const souce of sourceList.value) {
    if (souce instanceof GeoJsonPrimitiveLayer) {
      const feature = (souce as GeoJsonPrimitiveLayer).getFeatureItemById(pickedObject.id)
      if (feature?.properties) {
        property.value = feature.properties
        found = true;
        break
      }
    }
  }
  // 如果找不到对应feature → 关闭弹窗和billboard
  if (!found) {
    closePopup();
  }
}

// 安全关闭弹窗（彻底清理）
const closePopup = () => {
  property.value = {}
  popupShow.value = false
  if (billBoard) {
    billboardCollection.remove(billBoard)
  }
  billBoard = null
  selected = undefined
}

watch(() => property.value, () => {
  updatePopupPosition()
}, { deep: true })

watch(() => position.value, (value) => {
  if (billBoard) billboardCollection.remove(billBoard)
  billBoard = billboardCollection.add({
    show: true,
    image: '/Locate-copy.svg',
    distanceDisplayCondition: new DistanceDisplayCondition(0.0, 5000000.0),
    scale: 0.1,
    position: value
  })
})

watch(sourceList, (n, o) => {
  if (o.length > n.length) {
    closePopup();
  }
}, { deep: true });

onMounted(() => {
  viewer.scene.postRender.addEventListener(updatePopupPosition)
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

  handler = new ScreenSpaceEventHandler(viewer.canvas)
  handler.setInputAction((event: { position: Cartesian2 }) => {
    pickFeature(event.position)
  }, ScreenSpaceEventType.LEFT_CLICK)
})

onUnmounted(() => {
  viewer.scene.postRender.removeEventListener(updatePopupPosition)
  handler.destroy()
  closePopup(); // 组件销毁时也清理
})
</script>

<template>
  <AnimatePresence>
    <motion.div v-if="popupShow && Object.keys(property).length > 0" drag :dragElastic="0.2"
                :dragConstraints="viewer.canvas" :initial="{ opacity: 0, scale: 0, x: '-50%', y: '-100%' }" :animate="{
        opacity: 0.75,
        scale: 0.8,
        x: screenPosition.x,
        y: screenPosition.y,
        translateX: '-50%',
        translateY: '-100%',
        backgroundColor: 'rgba(255,255,255,0.9)'
      }" :whileDrag="{ scale: 0.6 }" :whileHover="{
        scale: 1.0,
        backgroundColor: 'rgba(243,246,255,0.98)',
        boxShadow: '0 10px 25px -5px rgba(59,130,246,0.4)'
      }" :exit="{ opacity: 0, scale: 0 }" :transition="{
        duration: 0.4,
        scale: { type: 'spring', bounce: 0.5 },
        x: { type: 'spring' },
        y: { type: 'spring' },
        backgroundColor: { duration: 0.2 }
      }" class="z-10 fixed pointer-events-auto rounded-lg">
      <Card class="w-full max-w-sm bg-transparent">
        <CardHeader class="relative">
          <CardTitle class="text-center">属性表</CardTitle>
          <CardAction class="absolute right-2 top-2">
            <Button variant="outline" size="icon-sm" @click="closePopup">
              <XIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <ScrollArea class="max-h-75">
                <TableRow v-for="(value, key) in property" :key="key">
                  <TableCell class="font-bold">{{ key }}</TableCell>
                  <TableCell>{{ value }}</TableCell>
                </TableRow>
              </ScrollArea>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  </AnimatePresence>
</template>
