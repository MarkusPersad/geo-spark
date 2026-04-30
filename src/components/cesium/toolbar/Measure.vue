<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RulerIcon } from 'lucide-vue-next';
import { computed, ComputedRef, inject, onUnmounted, ref } from 'vue';
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium';
import { AreaMeasure, AreaSurfaceMeasure, DistanceMeasure, DistanceSurfaceMeasure, Measure } from '@cesium-extends/measure';
import { isMeasuring } from '@/lib/state';
import { storeToRefs } from 'pinia';

const clapToGround = ref<boolean>(false)
const { isMeasure } = storeToRefs(isMeasuring())
const measureType = ref<'Distance' | 'Area'>('Distance')
const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const viewer = cesiumProvider?.viewer!
const measureColor = computed(() => (isMeasure.value ? '#f6d32d' : '#000000'));
const drawerOptions = {
  tips: {
    init: '点击绘制',
    start: '左键添加点，右键移除点，双击结束绘制',
  },
}
const areaMeasure = new AreaMeasure(viewer, {
  units: 'kilometres',
  drawerOptions: drawerOptions,
  locale: {
    start: '起点',
    area: '面积',
    total: '总计',
    formatLength: (length, unitlength) => {
      if (length < 1000) {
        return length + '米'
      }
      return unitlength + '千米'
    },
    formatArea: (area, unitArea) => {
      if (area < 1000000) {
        return area + '平方米'
      }
      return unitArea + '平方千米'
    }
  },
  onEnd: (_entity) => {
  }
})
const areaSurfaceMeasure = new AreaSurfaceMeasure(viewer, {
  units: 'kilometres',
  drawerOptions: drawerOptions,
  locale: {
    start: '起点',
    area: '面积',
    total: '总计',
    formatLength: (length, unitlength) => {
      if (length < 1000) {
        return length + '米'
      }
      return unitlength + '千米'
    },
    formatArea: (area, unitArea) => {
      if (area < 1000000) {
        return area + '平方米'
      }
      return unitArea + '平方千米'
    }
  },
  onEnd: (_entity) => {
  }
})

const distanceMeasure = new DistanceMeasure(viewer, {
  units: 'kilometres',
  drawerOptions: drawerOptions,
  locale: {
    start: '起点',
    area: '面积',
    total: '总计',
    formatLength: (length, unitlength) => {
      if (length < 1000) {
        return length + '米'
      }
      return unitlength + '千米'
    },
  },
  onEnd: (_entity) => {
  }
})

const distanceSurfaceMeasure = new DistanceSurfaceMeasure(viewer, {
  units: 'kilometres',
  drawerOptions: drawerOptions,
  locale: {
    start: '起点',
    area: '面积',
    total: '总计',
    formatLength: (length, unitlength) => {
      if (length < 1000) {
        return length + '米'
      }
      return unitlength + '千米'
    },
  },
  onEnd: (_entity) => {
  }
})

const measure: ComputedRef<Measure> = computed(() => {
  switch (measureType.value) {
    case 'Distance': {
      if (clapToGround.value) {
        return distanceSurfaceMeasure
      }
      return distanceMeasure
    }
    case 'Area': {
      if (clapToGround.value) {
        return areaSurfaceMeasure
      }
      return areaMeasure
    }
  }
})
const measureChange = () => {
  if (isMeasure.value) {
    measure.value.end()
  } else {
    measure.value.start()
  }
  isMeasure.value = !isMeasure.value
}
onUnmounted(() => {
  areaMeasure.destroy()
  areaSurfaceMeasure.destroy()
  distanceMeasure.destroy()
  distanceSurfaceMeasure.destroy()
})
</script>
<template>
  <HoverCard>
    <HoverCardTrigger asChild>
      <Button variant="outline" size="icon" @click="measureChange">
        <RulerIcon :color="measureColor" />
      </Button>
    </HoverCardTrigger>
    <HoverCardContent>
      <FieldSet>
        <FieldLegend>测量</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel for="measure-type">测量类型</FieldLabel>
            <Select id="measure-type" v-model="measureType">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Distance">距离</SelectItem>
                <SelectItem value="Area">面积</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="horizontal">
            <Checkbox v-model="clapToGround" id="clapToGround" />
            <FieldLabel for="clapToGround">贴地</FieldLabel>
          </Field>
          <Field></Field>
        </FieldGroup>
      </FieldSet>
    </HoverCardContent>
  </HoverCard>
</template>
