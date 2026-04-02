<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { computed, inject, Ref, ref, watch } from 'vue';
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Field, FieldLabel } from '@/components/ui/field';
import { CalendarIcon, ClockIcon, SunIcon } from 'lucide-vue-next';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field';
import 'v-calendar/style.css';
import { DatePicker } from 'v-calendar';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ClockRange, ClockStep, JulianDate } from "cesium";

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol);
const isShining: Ref<boolean> = ref(false);
const isClock: Ref<boolean> = ref(false);
const multiplier: Ref<number> = ref(1);
const sunColor = computed(() => (isShining.value ? '#f6d32d' : '#000000'));
const clockColor = computed(() => (isClock.value ? '#26a269' : '#000000'));

const timeRange = ref({
  start: new Date(),
  end: new Date()
});

const realTime: Ref<boolean> = ref(true);

// 监听时钟播放/暂停
watch(() => isClock.value, (newVal) => {
  if (cesiumProvider?.viewer) {
    cesiumProvider.viewer.clock.shouldAnimate = newVal;
  }
});

// 监听光照开关
watch(() => isShining.value, (newVal) => {
  if (cesiumProvider?.viewer) {
    cesiumProvider.viewer.scene.globe.enableLighting = newVal;
    cesiumProvider.viewer.shadows = newVal;
  }
});

// 监听倍速
watch(() => multiplier.value, (newVal) => {
  if (cesiumProvider?.viewer && !realTime.value) {
    cesiumProvider.viewer.clock.multiplier = newVal;
  }
});
// 监听时间
watch(() => timeRange.value, (value) => {
  if (cesiumProvider?.viewer && !realTime.value) {
    cesiumProvider.viewer.clock.startTime = JulianDate.fromDate(value.start);
    cesiumProvider.viewer.clock.stopTime = JulianDate.fromDate(value.end);
    cesiumProvider.viewer.clock.currentTime = JulianDate.fromDate(value.start);
  }
}, { deep: true })

watch(() => realTime.value, (value) => {
  if (cesiumProvider?.viewer) {
    if (value) {
      cesiumProvider.viewer.clock.clockStep = ClockStep.SYSTEM_CLOCK;
      cesiumProvider.viewer.clock.clockRange = ClockRange.UNBOUNDED;
      multiplier.value = 1;
      timeRange.value = {
        start: new Date(),
        end: new Date()
      }
      cesiumProvider.viewer.clock.currentTime = JulianDate.now();
    } else {
      cesiumProvider.viewer.clock.currentTime = JulianDate.fromDate(timeRange.value.start)
      cesiumProvider.viewer.clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER;
      cesiumProvider.viewer.clock.clockRange = ClockRange.LOOP_STOP;
    }
  }
}, { immediate: true })


</script>

<template>
  <Field orientation="horizontal" class="gap-2">
    <HoverCard>
      <HoverCardTrigger as-child>
        <Button variant="outline" size="icon" @click="isClock = !isClock">
          <ClockIcon :color="clockColor" />
        </Button>
      </HoverCardTrigger>
      <!-- 核心修复：w-fit自适应+max-w限制宽度，space-y-3垂直间距 -->
      <HoverCardContent class="w-fit max-w-120 p-4 space-y-3">
        <!-- DatePicker：w-full占满，popover-props限制日历浮层宽度 -->
        <DatePicker v-model.range="timeRange" mode="dateTime" is24hr class="w-full"
          :popover-props="{ class: 'w-[360px]' }">
          <template v-slot="{ togglePopover }">
            <Button :disabled="!isClock || realTime" variant="outline" @click="togglePopover"
              class="w-full justify-start">
              <CalendarIcon />
              <span class="ml-2 truncate">
                {{ timeRange.start.toLocaleString() }} - {{ timeRange.end.toLocaleString() }}
              </span>
            </Button>
          </template>
        </DatePicker>

        <!-- NumberField：w-full占满一行 -->
        <NumberField v-model="multiplier" :disabled="!isClock || realTime" id="multiplier" :defaultValue="1"
          class="w-full" :formatOptions="{
            signDisplay: 'exceptZero',
            minimumFractionDigits: 1,
          }">
          <FieldLabel for="multiplier">时间倍速</FieldLabel>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
        <template class="flex items-center space-x-2">
          <Switch :disabled="!isClock" v-model="realTime" id="Real" />
          <Label for="Real">实时</Label>
        </template>
      </HoverCardContent>
    </HoverCard>
    <Button variant="outline" size="icon" @click="isShining = !isShining">
      <SunIcon :color="sunColor" />
    </Button>
  </Field>
</template>
