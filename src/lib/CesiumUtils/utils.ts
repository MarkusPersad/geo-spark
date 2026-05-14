import { Cartesian2, Cartesian3, Cartographic, defined, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer, Math as CMath } from "cesium"

export const selectPosition = async (viewer: Viewer): Promise<Cartesian3> => {
  return new Promise((resolve) => {
    viewer.canvas.style.cursor = 'crosshair'
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((event: { position: Cartesian2 }) => {
      let cartesian = viewer.scene.pickPosition(event.position)
      if (!defined(cartesian)) {
        const ray = viewer.camera.getPickRay(event.position)
        if (defined(ray)) {
          cartesian = viewer.scene.globe.pick(ray, viewer.scene)!
        }
      }
      if (defined(cartesian)) {
        viewer.canvas.style.cursor = 'default'
        handler.destroy()
        resolve(cartesian)
      }
    }, ScreenSpaceEventType.LEFT_CLICK)
  })
}

export const cartesianToMsg = (cartesian: Cartesian3): string => {
  const cartographic = Cartographic.fromCartesian(cartesian)
  const lon = CMath.toDegrees(cartographic.longitude)
  const lat = CMath.toDegrees(cartographic.latitude)
  return `${lon.toFixed(6)},${lat.toFixed(6)}`
}

export const parserXml = (xmlStr: string) => {
  const parser = new DOMParser()
  return parser.parseFromString(xmlStr, 'text/xml')
}

export const getCoords = (routelatlon: string) => {
  return routelatlon.split(";").reduce((acc, item) => {
    if (!item) return acc

    const parts = item.split(',')
    const lon = Number.parseFloat(parts[0])
    const lat = Number.parseFloat(parts[1])

    // 只有当经纬度都是有效数字时才加入数组
    if (!isNaN(lon) && !isNaN(lat)) {
      acc.push({ lon, lat })
    }

    return acc
  }, [] as { lon: number; lat: number }[])
}
