<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium'
import { Cartesian3, Color, PointPrimitiveCollection } from 'cesium'
import { selectPosition, Viewshed3D } from '@/lib/CesiumUtils'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { EyeIcon, PipetteIcon, TrashIcon } from 'lucide-vue-next'
import { Field, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'


const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const viewer = cesiumProvider?.viewer!
const points = new PointPrimitiveCollection()
viewer.scene.primitives.add(points)
const viewPosition = ref<Cartesian3 | null>(null)
const viewPositionEnd = ref<Cartesian3 | null>(null)
const viewshed = ref<Viewshed3D | null>()

let startPoint: any = null
let endPoint: any = null


const updatePointMarker = (type: 'start' | 'end', position: Cartesian3 | null) => {
  if (type === 'start') {
    if (startPoint) points.remove(startPoint);
    if (position) {
      startPoint = points.add({
        position: position,
        color: Color.CHARTREUSE, // 亮绿色
        pixelSize: 10,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY // 保证不被地形遮挡
      });
    }
  } else {
    if (endPoint) points.remove(endPoint);
    if (position) {
      endPoint = points.add({
        position: position,
        color: Color.SKYBLUE,
        pixelSize: 10,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
    }
  }
}


watch(viewPosition, (value) => {
  updatePointMarker('start', value)
})
watch(viewPositionEnd, (value) => {
  updatePointMarker('end', value)
})

const selectViewPosition = async () => {
  viewPosition.value = await selectPosition(viewer)
}
const selectViewPositionEnd = async () => {
  viewPositionEnd.value = await selectPosition(viewer)
}

watch([viewPosition, viewPositionEnd], ([start, end]) => {
  if (start && end) {
    if (!viewshed.value) {
      viewshed.value = new Viewshed3D(viewer, {
        viewPosition: start,
        viewPositionEnd: end
      })
    } else {
      viewshed.value.viewPosition = start
      viewshed.value.viewPositionEnd = end
      viewshed.value.updatePosition(start, end)
    }
  } else {
    viewshed.value?.clear()
  }
}, { deep: true })

const clearAll = () => {
  if (viewshed.value) {
    viewshed.value.clear()
    viewshed.value = null
  }
  viewPosition.value = null
  viewPositionEnd.value = null
  startPoint = null
  endPoint = null
  points.removeAll()
}

onMounted(() => {
  viewer.scene.globe.depthTestAgainstTerrain = true
})
onUnmounted(() => {
  clearAll()
  viewer.scene.primitives.remove(points)
})
</script>
<template>
  <HoverCard>
    <HoverCardTrigger asChild>
      <Button variant="outline" size="icon">
        <EyeIcon />
      </Button>
    </HoverCardTrigger>
    <HoverCardContent class="w-80">
      <FieldSet>
        <FieldLegend>可视域分析</FieldLegend>
        <Field>
          <FieldLabel>观测点 (起点)</FieldLabel>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex-1 text-xs truncate bg-muted p-2 rounded text-green-400">
              {{ viewPosition ? '已选取' : '未选取' }}
            </div>
            <Button variant="outline" size="icon" @click="selectViewPosition">
              <PipetteIcon class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" @click="viewPosition = null">
              <TrashIcon class="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </Field>

        <Field>
          <FieldLabel>目标点 (终点)</FieldLabel>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex-1 text-xs truncate bg-muted p-2 rounded text-sky-500">
              {{ viewPositionEnd ? '已选取' : '未选取' }}
            </div>
            <Button variant="outline" size="icon" @click="selectViewPositionEnd">
              <PipetteIcon class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" @click="viewPositionEnd = null">
              <TrashIcon class="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </Field>

        <div class="pt-2 border-t mt-2">
          <Button variant="destructive" class="w-full" size="sm" @click="clearAll">
            重置并清除标记
          </Button>
        </div>
      </FieldSet>
    </HoverCardContent>
  </HoverCard>
</template>
