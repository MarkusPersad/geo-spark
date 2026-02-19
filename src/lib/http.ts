import {ClientOptions, fetch} from '@tauri-apps/plugin-http'
import {AppStore} from "@/lib/state/store.ts";
import { BaseURL,API } from '@/assets/default.json'

const ACCESS_STATUS = "Access-Status"
const REFRESH_HEADER = "X-Refresh"
const ACCESS_HEADER = "Authorization"
export class Http{
    private static headers:Record<string, string> = {
        'Content-Type': 'application/json'
    }
    private static isRefreshing:boolean = false
    public static setHeaders(headers:Record<string, string>){
        Http.headers = {...Http.headers, ...headers}
    }
    public static deleteHeaders(...keys:string[]){
        keys.forEach(key => {
            delete Http.headers[key]
        })
    }

    public static getHeaders(){
        return Http.headers
    }

        /**
     * 发起HTTP请求并处理认证相关的自动刷新逻辑
     * @param input - 请求的目标URL，可以是字符串、URL对象或Request对象
     * @param init - 可选的请求初始化配置，包含RequestInit和ClientOptions的属性
     * @returns Promise<Response> 返回请求的响应对象
     */
    public static async useFetch(
        input: URL | Request | string,
        init?: RequestInit & ClientOptions,
    ): Promise<Response>{
        try {
            // 发起HTTP请求，合并传入的配置和全局请求头
            let res = await fetch(input,{
                ...init,
                headers: Http.getHeaders()
            })

            // 检查响应是否成功
            if (!res.ok){
                throw new Error('请求失败')
            }

            // 检查是否需要刷新访问令牌
            if (res.headers.has(ACCESS_STATUS)){
                if (res.headers.get(ACCESS_STATUS)){
                    // 执行令牌刷新并重新发起请求
                    await Http.refreshToken()
                    return await Http.useFetch(input,init)
                }
            }
            if (res.headers.has(ACCESS_HEADER)){
                Http.setHeaders({
                    [ACCESS_HEADER]: `Bearer ${res.headers.get(ACCESS_HEADER)!}`
                })
            }
            if (res.headers.has(REFRESH_HEADER)){
                await AppStore.SetValue(REFRESH_HEADER, res.headers.get(REFRESH_HEADER)!)
                await AppStore.Save()
            }
            return res
        } catch (err:any) {
            throw new Error(err.message||String(err))
        }
    }


        /**
     * 刷新访问令牌
     * 该函数用于在访问令牌过期时自动刷新令牌，确保用户会话的连续性
     * @returns Promise<void> 无返回值的异步函数
     */
    public static async refreshToken(){
        // 检查是否正在刷新中，避免重复刷新
        if (Http.isRefreshing){
            return
        }
        Http.isRefreshing = true

        // 获取存储的刷新令牌
        let refreshToken = await AppStore.GetValue<string>(REFRESH_HEADER)
        if (!refreshToken){
             throw new Error('刷新令牌异常')
        }

        // 设置请求头包含刷新令牌
        Http.setHeaders({
            [REFRESH_HEADER]: refreshToken
        })

        // 向服务器发送刷新令牌请求
        let url = `${BaseURL}${API.Refresh}`
        let refreshRes = await fetch(url,{
            method: 'GET',
            headers: Http.getHeaders()
        })
        if (!refreshRes.ok){
            throw new Error('刷新令牌失败')
        }
        console.log(refreshRes)

        // 处理服务器返回的新刷新令牌
        let newRefreshToken = refreshRes.headers.get(REFRESH_HEADER)
        if (!newRefreshToken){
            throw new Error('从响应头获取刷新令牌异常')
        }
        await AppStore.SetValue(REFRESH_HEADER, newRefreshToken)

        // 处理服务器返回的新访问令牌
        let accessToken = refreshRes.headers.get(ACCESS_HEADER)
        if (!accessToken){
            throw new Error('从响应头获取访问令牌异常')
        }
        Http.setHeaders({
            [ACCESS_HEADER]: `Bearer ${accessToken}`
        })
        await AppStore.Save()

        // 清理临时使用的刷新令牌头并重置刷新状态
        Http.deleteHeaders(REFRESH_HEADER)
        Http.isRefreshing = false
    }

}