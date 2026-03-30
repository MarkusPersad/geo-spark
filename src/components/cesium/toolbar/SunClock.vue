<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { computed, inject, Ref, ref, watch } from 'vue';
import { CesiumProvider, cesiumProviderSymbol } from '@/components/cesium';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Field, FieldLabel } from '@/components/ui/field';
import { ClockIcon, SunIcon } from 'lucide-vue-next';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const isShining: Ref<boolean> = ref(false)
const isClock: Ref<boolean> = ref(false)
const multiplier: Ref<number> = ref(1)
const sunColor = computed(() => (isShining.value ? '#f6d32d' : '#000000'))
const clockColor = computed(() => (isClock.value ? '#26a269' : '#000000'))
watch(() => isClock.value, (newVal) => {
  if (cesiumProvider?.viewer) {
    cesiumProvider.viewer.clock.shouldAnimate = newVal;
  }
})
watch(() => isShining.value, (newVal) => {
  if (cesiumProvider?.viewer) {
    if (newVal) {
      cesiumProvider.viewer.scene.globe.enableLighting = true
      cesiumProvider.viewer.shadows = true
    } else {
      cesiumProvider.viewer.scene.globe.enableLighting = false
      cesiumProvider.viewer.shadows = false
    }
  }
})

watch(() => multiplier.value, (newVal) => {
  if (cesiumProvider?.viewer) {
    cesiumProvider.viewer.clock.multiplier = newVal
  }
})

</script>
<template>
  <Field orientation="horizontal" class="gap-2">
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline" size="icon" @click="isClock = !isClock">
          <ClockIcon :color="clockColor" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <NumberField v-model="multiplier" :disabled="!isClock" id="multiplier" :defaultValue="1" :formatOptions="{
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
      </HoverCardContent>
    </HoverCard>
    <Button variant="outline" size="icon" @click="isShining = !isShining">
      <SunIcon :color="sunColor" />
    </Button>
  </Field>
</template>
