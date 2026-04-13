<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import { inject, onMounted, onUnmounted, ref,watch } from 'vue';
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium';
import {
  Cartesian2,
  Cartesian3,
  Entity,
  SceneTransforms,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType
} from 'cesium';
import { Card, CardAction, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-vue-next';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { storeToRefs } from 'pinia';
import { useSources } from '@/lib/state';
import GeoJsonPrimitiveLayer from '@cesium-extends/primitive-geojson';

// 类型定义
type PopupProperty = Record<string, string>;

// 依赖注入
const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol);
const viewer = cesiumProvider?.viewer;
if (!viewer) throw new Error('Cesium Viewer 未初始化');

// 响应式状态
const position = ref<Cartesian3>(Cartesian3.ZERO);
const screenPosition = ref<Cartesian2>(Cartesian2.ZERO);
const popupShow = ref<boolean>(false);
const property = ref<PopupProperty>({});
const { sourceList } = storeToRefs(useSources());

// 事件处理器
let handler: ScreenSpaceEventHandler | null = null;

/**
 * 更新弹窗屏幕坐标与显隐状态
 */
const updatePopupPosition = () => {
  if (!viewer || !Object.keys(property.value).length) return;

  // 转换世界坐标为屏幕坐标
  const cartesian2 = SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      position.value
  );
  if (!cartesian2) return;

  screenPosition.value = cartesian2;

  // 距离与高度判断
  const cameraPos = viewer.camera.position;
  const ellipsoid = viewer.scene.globe.ellipsoid;
  const cameraHeight = ellipsoid.cartesianToCartographic(cameraPos).height;
  const maxDistance = ellipsoid.maximumRadius + cameraHeight;
  const isInViewDistance = Cartesian3.distance(cameraPos, position.value) < maxDistance;
  const isInViewHeight = cameraHeight < 5000000;

  popupShow.value = isInViewDistance && isInViewHeight;
};

/**
 * 关闭弹窗
 */
const closePopup = () => {
  property.value = {};
  popupShow.value = false;
};

/**
 * 拾取实体/要素并获取属性
 */
const pickFeatureProperties = (clickPosition: Cartesian2) => {
  if (!viewer) return;

  // 拾取坐标
  const ray = viewer.camera.getPickRay(clickPosition);
  if (!ray) return;

  const pickedPosition = viewer.scene.globe.pick(ray, viewer.scene);
  if (pickedPosition) position.value = pickedPosition;

  // 拾取对象
  const pickedObject = viewer.scene.pick(clickPosition);
  if (!pickedObject?.id) {
    closePopup();
    return;
  }

  // 处理 Cesium Entity
  if (pickedObject.id instanceof Entity) {
    const entity = pickedObject.id as Entity;
    if (entity.properties) {
      const currentTime = viewer.clock.currentTime;
      property.value = entity.properties.getValue(currentTime) || {};
    }
    return;
  }

  // 处理 GeoJsonPrimitiveLayer
  for (const source of sourceList.value) {
    if (source instanceof GeoJsonPrimitiveLayer) {
      const feature = source.getFeatureItemById(pickedObject.id);
      if (feature?.properties) {
        property.value = feature.properties;
        break;
      }
    }
  }
};

// 监听属性变化，自动更新弹窗
watch(
    () => property.value,
    () => {
      updatePopupPosition();
    },
    { deep: true }
);

onMounted(() => {
  if (!viewer) return;

  // 注册场景渲染监听
  viewer.scene.postRender.addEventListener(updatePopupPosition);

  // 禁用默认点击事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  // 初始化自定义事件
  handler = new ScreenSpaceEventHandler(viewer.canvas);

  // 点击拾取
  handler.setInputAction((event: { position: Cartesian2 }) => {
    pickFeatureProperties(event.position);
  }, ScreenSpaceEventType.LEFT_CLICK);
});

// 销毁时清理事件，防止内存泄漏
onUnmounted(() => {
  if (!viewer || !handler) return;

  viewer.scene.postRender.removeEventListener(updatePopupPosition);
  handler.destroy();
  handler = null;
});
</script>

<template>
  <AnimatePresence>
    <motion.div
        v-if="Object.keys(property).length > 0 && popupShow"
        drag
        :drag-elastic="0.2"
        :drag-constraints="viewer?.canvas"
        :initial="{ opacity: 0, scale: 0, x: '-50%', y: '-100%' }"
        :animate="{
        opacity: 0.75,
        scale: 0.8,
        x: screenPosition.x,
        y: screenPosition.y,
        translateX: '-50%',
        translateY: '-100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }"
    :while-hover="{
    scale: 1,
    backgroundColor: 'rgba(243, 246, 255, 0.98)',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
    }"
    :while-drag="{ scale: 0.6 }"
    :exit="{ opacity: 0, scale: 0 }"
    :transition="{
    duration: 0.4,
    scale: { type: 'spring', bounce: 0.5 },
    x: { type: 'spring' },
    y: { type: 'spring' },
    backgroundColor: { duration: 0.2 }
    }"
    class="z-10 fixed pointer-events-auto rounded-lg"
    >
    <Card class="w-full max-w-sm bg-transparent">
      <CardHeader class="relative">
        <CardTitle class="text-center">属性表</CardTitle>
        <CardAction class="absolute right-4 top-4">
          <Button variant="outline" size="icon-sm" @click="closePopup">
            <XIcon class="w-4 h-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ScrollArea class="max-h-75">
          <Table>
            <TableBody>
              <TableRow v-for="(value, key) in property" :key="key">
                <TableCell class="font-medium">{{ key }}</TableCell>
                <TableCell>{{ value }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
    </motion.div>
  </AnimatePresence>
</template>

<style scoped>
.pointer-events-auto {
  pointer-events: auto;
}
:deep(.Card) {
  background: transparent !important;
}
</style>
