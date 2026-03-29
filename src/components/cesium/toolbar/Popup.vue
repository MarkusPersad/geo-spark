<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import { inject, onMounted, ref, Ref,watch } from 'vue';
import { CesiumProvider,cesiumProviderSymbol } from '@/components/cesium';
import { Cartesian2, Cartesian3, Entity, SceneTransforms, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { Card,CardAction,CardHeader,CardTitle,CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-vue-next';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { storeToRefs } from 'pinia';
import { useSources } from '@/lib/state';
import GeoJsonPrimitiveLayer from '@cesium-extends/primitive-geojson';

const cesiumProvider = inject<CesiumProvider>(cesiumProviderSymbol)
const position:Ref<Cartesian3> = ref(Cartesian3.ZERO)
const screenPosition :Ref<Cartesian2> = ref(Cartesian2.ZERO)
const PopupShow:Ref<boolean> = ref(false)
const property:Ref<Record<string,string>> = ref({})
const {sourceList} = storeToRefs(useSources())

const handler = new ScreenSpaceEventHandler(cesiumProvider?.viewer?.canvas)

const postRender = () =>{
    if(cesiumProvider?.viewer&&property.value){
        screenPosition.value = SceneTransforms.worldToWindowCoordinates(
            cesiumProvider?.viewer?.scene!,
            position.value,
        )!
        const cameraPosition = cesiumProvider.viewer.camera.position
        let height = cesiumProvider.viewer.scene.globe.ellipsoid.cartesianToCartographic(
            cameraPosition
        ).height + cesiumProvider.viewer.scene.globe.ellipsoid.maximumRadius
        if(
            !(Cartesian3.distance(cameraPosition,position.value)>height)&&
            cesiumProvider.viewer.camera.positionCartographic.height < 5000000
        ){
            PopupShow.value = true
        }else{
            PopupShow.value = false
        }
    }
}

watch(()=>property.value,()=>{
    postRender()
})
onMounted(()=>{
    if(cesiumProvider?.viewer){
        cesiumProvider.viewer.scene.postRender.addEventListener(postRender)
        cesiumProvider.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
        cesiumProvider.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

        //@ts-ignore
        handler.setInputAction(clickEvent =>{
            const ray = cesiumProvider.viewer?.camera.getPickRay(clickEvent.position)!
            position.value = cesiumProvider.viewer?.scene.globe.pick(ray,cesiumProvider.viewer.scene)!
            const pickedObject = cesiumProvider.viewer?.scene.pick(clickEvent.position)
            if(pickedObject.id instanceof Entity){
                const entity = pickedObject.id as Entity
                if(entity.properties){
                    const time = cesiumProvider.viewer?.clock.currentTime
                    property.value = entity.properties.getValue(time)
                }
            } else{
                for (const source of sourceList.value){
                    if(source instanceof GeoJsonPrimitiveLayer){
                        const primitiveItem = source.getFeatureItemById(pickedObject.id)
                        if(primitiveItem){
                            property.value = primitiveItem.properties!
                            break
                        }
                    }
                }
            } 
        },ScreenSpaceEventType.LEFT_CLICK)
    }
})
</script>

<template>
    <AnimatePresence>
        <motion.div
            v-if=" Object.keys(property).length !== 0"
            v-show="PopupShow" 
            drag
            :drag-elastic="0.2"
            :drag-constraints="cesiumProvider?.viewer?.canvas"
            :initial="{opacity: 0,scale: 0,translateX: '-50%', translateY: '-100%'}"
            :animate="{opacity:0.75,scale:0.8,x:screenPosition?.x,y:screenPosition?.y,translateX: '-50%',translateY: '-100%'}"
            :exit="{opacity:0,scale:0}"
            :while-hover="{scale:1}"
            :while-drag="{scale:0.6}"
            :transition="{
                duration:0.4,
                scale:{type:'spring',visualDuration:0.4,bounce:0.5},
                x:{type:'spring'},
                y:{type:'spring'}
            }"
            class="z-10 fixed"
        >
            <Card class="w-full max-w-sm">
                <CardHeader>
                    <CardTitle class="text-center">属性表</CardTitle>
                    <CardDescription></CardDescription>
                    <CardAction>
                        <Button 
                            variant="outline"
                            size="icon-sm"
                            @click="()=>{
                                property = {}
                            }"
                        >
                            <XIcon />
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            <ScrollArea>
                                <TableRow v-for="item in Object.entries(property!)" :key="item[0]">
                                    <template class="flex">
                                        <TableCell>{{item[0]}}</TableCell>
                                        <TableCell>{{ item[1] }}</TableCell>
                                    </template>
                                    <Separator />
                                </TableRow>
                            </ScrollArea>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    </AnimatePresence>
</template>