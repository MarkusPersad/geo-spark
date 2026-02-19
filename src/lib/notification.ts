import {invoke} from "@tauri-apps/api/core";
import { Command } from "@tauri-apps/plugin-shell";
import {isPermissionGranted, requestPermission,sendNotification as sendNotify} from "@tauri-apps/plugin-notification";

/**
 * 通知管理类，用于发送桌面通知
 * 根据不同平台自动适配通知图标和发送方式
 */
export class Notification {
    /**
     * 当前运行平台标识
     * @private
     */
    private static  CURRENT_PLATFORM : string;

    /**
     * 成功状态图标路径
     */
    public static SUCCESS: string

    /**
     * 警告状态图标路径
     */
    public static WARNING: string

    /**
     * 错误状态图标路径
     */
    public static ERROR: string

    /**
     * 信息状态图标路径
     */
    public static INFO: string

    /**
     * 静态初始化块，用于初始化平台相关配置
     * 通过调用Tauri命令获取当前平台，并设置对应的通知图标
     */
    static {
        invoke("get_desktop_environment").then((platform ) => {
            Notification.CURRENT_PLATFORM = platform as string;
            Notification.SUCCESS = Notification.CURRENT_PLATFORM !== 'windows'&& Notification.CURRENT_PLATFORM !== 'macos' ? 'dialog-ok':'assets/success.png';
            Notification.WARNING = Notification.CURRENT_PLATFORM !== 'windows'&&Notification.CURRENT_PLATFORM !== 'macos' ? 'dialog-warning':'assets/warning.png';
            Notification.ERROR = Notification.CURRENT_PLATFORM !== 'windows'&& Notification.CURRENT_PLATFORM !== 'macos' ? 'dialog-error':'assets/error.png';
            Notification.INFO = Notification.CURRENT_PLATFORM !== 'windows'&& Notification.CURRENT_PLATFORM !== 'macos' ? 'dialog-information':'assets/info.png';
        });
    }

    /**
     * 发送桌面通知
     * @param content 通知内容对象
     * @param content.icon 通知图标，应使用预定义的静态图标常量
     * @param content.body 通知正文内容
     */
    public static async sendNotification(content : {
        icon: typeof Notification.SUCCESS | typeof Notification.WARNING | typeof Notification.ERROR | typeof Notification.INFO,
        body: any,
    }){
        if(Notification.CURRENT_PLATFORM === 'gnome'){
            await Command.create('notify-send', [
                '-u',
                'critical',
                '-i',
                content.icon,
                'RH-Chat',
                content.body
            ]).execute();
        }else {
            let permissionGranted = await isPermissionGranted();
            if(!permissionGranted){
                const permission = await requestPermission();
                permissionGranted = permission === "granted";
            }
            if(permissionGranted){
                sendNotify({
                    title: "Geo-Spark",
                    icon: content.icon,
                    body:content.body,
                })
            }
        }
    }
}