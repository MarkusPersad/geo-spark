import { createRouter, createWebHashHistory } from "vue-router"
import {invoke} from "@tauri-apps/api/core";
import { Notification } from '@/lib'
import {exit} from "@tauri-apps/plugin-process";
export const router = () =>{
    try {
        const router = createRouter({
            history: createWebHashHistory(),
            routes: [
                {
                    path: '/',
                    redirect: '/login'
                },
                {
                    path: '/login',
                    component: () => import('@/pages/Login.vue')
                },
                {
                    path: '/main',
                    component: () => import('@/pages/Main.vue'),
                    children: [
                        {
                            path: '',
                            redirect: '/data'
                        },
                        {
                            path: '/map',
                            component: () => import('@/mainViews/CesiumShow.vue')
                        },
                        {
                            path: '/data',
                            component: () => import('@/mainViews/DataManager.vue')
                        }
                    ]
                }
            ]
        })
        router.afterEach(async (to) =>{
            console.log(to.path)
            if (to.path !== '/login'){
                invoke('update_state',{value: true})
            }
        })
        router.isReady().then(async () =>{
            await invoke("close_splashscreen")
            await Notification.sendNotification({
                icon: Notification.INFO,
                body: "欢迎使用Geo-Spark"
            })
        }).catch((err) =>{
            throw new Error(err)
        })
        return router
    } catch (err:any) {
        Notification.sendNotification({
            icon: Notification.ERROR,
            body: err.message||String(err)
       }).then(async () =>{
           await exit(0)
        })
    }
}