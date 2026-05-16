<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium'
import {
  Cartesian3,
  Cartographic,
  Color,
  HeightReference,
  JulianDate,
  LagrangePolynomialApproximation,
  PointPrimitiveCollection,
  SampledPositionProperty,
  sampleTerrainMostDetailed,
  VelocityOrientationProperty,
  ClockRange,
  TimeIntervalCollection,
  TimeInterval,
  EllipsoidTerrainProvider
} from 'cesium'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Button } from '@/components/ui/button'
import { PipetteIcon, RouteIcon, TrashIcon } from 'lucide-vue-next'
import { cartesianToMsg, getCoords, parserXml, selectPosition } from '@/lib/CesiumUtils'
import { Field, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BaseURL, API } from '@/assets/default.json'
import { Http } from '@/lib'
import { toast } from 'vue-sonner'

// 1. 引入全局时钟状态管理
import { useClock } from '@/lib/state'

const clockStore = useClock()
const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const viewer = cesiumProvider?.viewer!

// 存储地图上的点位标记
const points = new PointPrimitiveCollection()
viewer.scene.primitives.add(points)

// 响应式状态
const startPosition = ref<Cartesian3 | null>(null)
const endPosition = ref<Cartesian3 | null>(null)
const mode = ref<"0" | "1" | "2" | "3">("0")

const model = computed(() => mode.value === '3' ? '/Cesium_Man.glb' : '/CesiumMilkTruck.glb')

// 非响应式变量
let startPoint: any = null
let endPoint: any = null
let entity: any = null

/**
 * 更新起点和终点的 Marker
 */
const updatePointMarker = (type: 'start' | 'end', position: Cartesian3 | null) => {
  if (type === 'start') {
    if (startPoint) points.remove(startPoint)
    if (position) {
      startPoint = points.add({
        position: position,
        color: Color.CHARTREUSE,
        pixelSize: 10,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      })
    }
  } else {
    if (endPoint) points.remove(endPoint)
    if (position) {
      endPoint = points.add({
        position: position,
        color: Color.SKYBLUE,
        pixelSize: 10,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      })
    }
  }
}

watch(startPosition, (val) => updatePointMarker('start', val))
watch(endPosition, (val) => updatePointMarker('end', val))

const selectStartPosition = async () => {
  startPosition.value = await selectPosition(viewer) //
}
const selectEndPosition = async () => {
  endPosition.value = await selectPosition(viewer) //
}

/**
 * 清除所有状态并重置时钟
 */
const clearAll = () => {
  startPoint = null
  endPoint = null
  startPosition.value = null
  endPosition.value = null

  if (entity) {
    viewer.entities.remove(entity)
    entity = null
  }

  points.removeAll()
  viewer.trackedEntity = undefined // 取消视角跟随

  // 重置全局 Pinia 状态
  clockStore.clockState.isClock = false
  clockStore.clockState.realTime = true
  clockStore.clockState.timeRangeBorrowed = false
  clockStore.clockState.multiplier = 1.0

  // 重置 Cesium 时钟
  viewer.clock.multiplier = 1.0
  viewer.clock.shouldAnimate = false
}

// 自动监听参数变化并规划路径
watch([startPosition, endPosition, mode], async ([start, end, modeVal]) => {
  if (start && end && modeVal) await getRoutePlan()
})

/**
 * 请求路径规划数据
 */
const getRoutePlan = async () => {
  try {
    const url = `${BaseURL}${API.ROUTEPLAN}`
    const res = await Http.useFetch(url, {
      method: "POST",
      body: JSON.stringify({
        "start": cartesianToMsg(startPosition.value!), //
        "end": cartesianToMsg(endPosition.value!),
        "mode": model.value
      })
    })
    if (!res.ok) throw new Error("路径规划请求失败")
    const response = await res.text()
    createModelAnimotion(response)
  } catch (err: any) {
    toast.error(err.message || String(err))
  }
}

/**
 * 核心逻辑：时钟与全局状态同步
 */
const syncClockAndState = (startTime: JulianDate, stopTime: JulianDate) => {
  const multiplier = 10.0

  // 1. 同步 Cesium Viewer 时钟
  viewer.clock.startTime = startTime.clone()
  viewer.clock.stopTime = stopTime.clone()
  viewer.clock.currentTime = startTime.clone()
  viewer.clock.clockRange = ClockRange.LOOP_STOP
  viewer.clock.multiplier = multiplier
  viewer.clock.shouldAnimate = true

  // 2. 同步 Pinia 全局状态
  clockStore.clockState.isClock = true
  clockStore.clockState.realTime = false
  clockStore.clockState.timeRangeBorrowed = true
  clockStore.clockState.multiplier = multiplier
  clockStore.clockState.timeRange.start = JulianDate.toDate(startTime)
  clockStore.clockState.timeRange.end = JulianDate.toDate(stopTime)
}

/**
 * 核心逻辑：创建实体
 */
const finalizeEntityCreation = (positions: Cartographic[], startTime: JulianDate, duration: number, stopTime: JulianDate) => {
  if (!startPosition.value) return

  const property = new SampledPositionProperty()
  property.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: LagrangePolynomialApproximation
  })

  positions.forEach((cartographic, index) => {
    if (!cartographic || isNaN(cartographic.longitude) || isNaN(cartographic.latitude)) return

    const time = JulianDate.addSeconds(
      startTime,
      (index / (positions.length - 1)) * duration,
      new JulianDate()
    )

    // 确保高度有效，NaN 时默认为 0
    const h = (typeof cartographic.height === 'number' && !isNaN(cartographic.height)) ? cartographic.height : 0

    const position = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, h)
    property.addSample(time, position)
  })

  if (entity) viewer.entities.remove(entity)

  syncClockAndState(startTime, stopTime)

  entity = viewer.entities.add({
    availability: new TimeIntervalCollection([
      new TimeInterval({ start: startTime, stop: stopTime })
    ]),
    position: property,
    orientation: new VelocityOrientationProperty(property), // 自动车头朝向
    model: {
      uri: model.value,
      heightReference: HeightReference.NONE,
      minimumPixelSize: 64
    },
    path: { resolution: 1, material: Color.YELLOW, width: 5 }
  })

  viewer.trackedEntity = undefined // 默认不开启视角追逐
}

/**
 * 运动模型加载：地形自适应逻辑
 */
const createModelAnimotion = async (xmlStr: string) => {
  const xmlDoc = parserXml(xmlStr) //
  const rawCoords = getCoords(xmlDoc.getElementsByTagName("routelatlon")[0].textContent!) //

  const startTime = JulianDate.fromDate(new Date())
  const duration = Number.parseFloat(xmlDoc.getElementsByTagName("duration")[0].textContent!)
  const stopTime = JulianDate.addSeconds(startTime, duration, new JulianDate())

  // 去重
  const filteredCoords = rawCoords.filter((coord, index, arr) => {
    if (index === 0) return true
    return coord.lon !== arr[index - 1].lon || coord.lat !== arr[index - 1].lat
  })

  if (filteredCoords.length < 2) return
  const cartoPositions = filteredCoords.map(c => Cartographic.fromDegrees(c.lon, c.lat))

  // 地形判断逻辑
  const isTerrainEnabled = viewer.terrainProvider && !(viewer.terrainProvider instanceof EllipsoidTerrainProvider)

  if (isTerrainEnabled) {
    try {
      // 5秒超时保护：防止地形采样卡死
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("地形服务超时")), 5000))
      const updated = await Promise.race([
        sampleTerrainMostDetailed(viewer.terrainProvider, cartoPositions),
        timeout
      ]) as Cartographic[]

      finalizeEntityCreation(updated, startTime, duration, stopTime)
    } catch (err: any) {
      toast.error(`切换至无地形ERROR:${err.message || String(err)}`)
      finalizeEntityCreation(cartoPositions, startTime, duration, stopTime)
    }
  } else {
    finalizeEntityCreation(cartoPositions, startTime, duration, stopTime)
  }
}
</script>

<template>
  <HoverCard>
    <HoverCardTrigger asChild>
      <Button variant="outline" size="icon">
        <RouteIcon />
      </Button>
    </HoverCardTrigger>
    <HoverCardContent class="w-80">
      <FieldSet>
        <FieldLegend>路径规划</FieldLegend>

        <Field>
          <FieldLabel>起点</FieldLabel>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex-1 text-xs truncate bg-muted p-2 rounded text-green-400">
              {{ startPosition ? '已选取' : '未选取' }}
            </div>
            <Button variant="outline" size="icon" @click="selectStartPosition">
              <PipetteIcon class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" @click="startPosition = null">
              <TrashIcon class="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </Field>

        <Field>
          <FieldLabel>终点</FieldLabel>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex-1 text-xs truncate bg-muted p-2 rounded text-sky-500">
              {{ endPosition ? '已选取' : '未选取' }}
            </div>
            <Button variant="outline" size="icon" @click="selectEndPosition">
              <PipetteIcon class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" @click="endPosition = null">
              <TrashIcon class="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </Field>

        <Field>
          <FieldLabel for="mode">模式</FieldLabel>
          <Select id="mode" v-model="mode">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">最快路线</SelectItem>
              <SelectItem value="1">最短路线</SelectItem>
              <SelectItem value="2">避开高速</SelectItem>
              <SelectItem value="3">步行</SelectItem>
            </SelectContent>
          </Select>
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
