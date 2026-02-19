import {defaultWindowIcon} from "@tauri-apps/api/app";
import {TrayIcon} from "@tauri-apps/api/tray";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {Menu} from "@tauri-apps/api/menu/menu";
import {exit, relaunch} from "@tauri-apps/plugin-process";
import { logout } from '@/components/main'
import {Notification} from "@/lib/notification.ts";

export const setTray = async () => {
    const defaultIcon = await defaultWindowIcon();
    return await TrayIcon.new({
        icon: defaultIcon!,
        tooltip: "Geo Spark",
        showMenuOnLeftClick: false,
        action: async event => {
            if (event.type === 'Click') {
                await showMainWindow();
            }
        },
        menu: await Menu.new({
            items: [
                {
                    id:"showMainWindow",
                    text:"显示主窗口",
                    action:async () =>{
                       try {
                           await showMainWindow();
                       } catch (err:any) {
                           Notification.sendNotification({
                               icon: Notification.ERROR,
                               body: err.message || String(err)
                           })
                       }
                    }
                },
                {
                    id:"Restart",
                    text:"重启应用",
                    action:async () =>{
                       try {
                           await relaunch();
                       } catch (err:any) {
                           Notification.sendNotification({
                               icon: Notification.ERROR,
                               body: err.message || String(err)
                           })
                       }
                    }
                },
                {
                    id: "quit",
                    text: "推出",
                    action: async () =>{
                        try {
                            await logout()
                        } catch (err:any) {
                            await Notification.sendNotification({
                                icon: Notification.ERROR,
                                body: err.message || String(err)
                            })
                        } finally {
                            await exit(0)
                        }
                    }
                }
            ]
        })

    })
}

async function showMainWindow(){
    try {
        const mainWindow =  getCurrentWindow();
        if(!(await mainWindow.isVisible())){
            await mainWindow.show();
        } else {
            if((await mainWindow.isMinimized())){
                await mainWindow.unminimize();
            }
        }
        await mainWindow.setFocus();
    } catch (err:any) {
        throw new Error(err)
    }
}
