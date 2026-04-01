import {Camera, Rectangle, SceneMode, Viewer} from "cesium";
import {InjectionKey, Ref, ShallowRef} from "vue";

export interface CesiumProvider {
    viewer:Viewer|null
}
export const cesiumProviderSymbol = Symbol.for('CesiumProvider') as InjectionKey<CesiumProvider>

export const InitViewer = (ref:Readonly<ShallowRef<HTMLDivElement|null>>,provider:CesiumProvider,isReady:Ref<boolean>,home:[number,number,number,number] = [73.5, 3.5, 135, 54]) => {
    if (ref.value){
        provider.viewer = new Viewer(ref.value!,{
            homeButton: false,
            geocoder: false,
            automaticallyTrackDataSourceClocks: false,
            animation: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            baseLayer: false,
            timeline: false,
            sceneMode: SceneMode.SCENE3D,
            selectionIndicator: false,
            infoBox: false,
            projectionPicker: false,
            vrButton: false,
            fullscreenButton: false,
            navigationHelpButton: false,
            contextOptions: {
                webgl: {
                    preserveDrawingBuffer: true, //支持html2canvas截图
                    alpha: true,
                },
            },
            requestRenderMode: true,
        })
        provider.viewer.creditDisplay.container.style.display = 'none'
        provider.viewer.scene.globe.tileCacheSize = 1000
        Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(...home)
        provider.viewer.camera.flyHome(2.0)
        isReady.value = true
    }
}