import { AppStore } from "@/lib/state";
import { BaseURL, API } from '@/assets/default.json';
import { fetch, ClientOptions } from '@tauri-apps/plugin-http';

const REFRESH_HEADER = "X-Refresh"
const ACCESS_HEADER = "Authorization"
const ACCESS_STATUS = "Access-Status"

export class RefreshQueue {
    private refreshPromise: Promise<void> | null = null;
    private lastRefreshTime: number = 0;
    // 刷新有效时间：15分钟
    private readonly REFRESH_VALIDITY = 5 * 60 * 1000;

    async executeRefresh(refreshFn: () => Promise<void>, force: boolean = false): Promise<void> {
        // 非强制模式下，检查是否在有效时间内
        if (!force && this.isRefreshValid()) {
            return this.refreshPromise || Promise.resolve();
        }

        // 如果已有刷新在进行中，复用该 Promise（避免重复请求）
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        // 执行刷新
        this.refreshPromise = refreshFn()
            .then(() => {
                this.lastRefreshTime = Date.now();
            })
            .catch((err) => {
                // 失败时重置时间戳，允许立即重试
                this.lastRefreshTime = 0;
                throw err;
            })
            .finally(() => {
                this.refreshPromise = null;
            });

        return this.refreshPromise;
    }

    isRefreshValid(): boolean {
        return Date.now() - this.lastRefreshTime < this.REFRESH_VALIDITY;
    }
}

export class Http {
    private static headers: Record<string, string> = {
        'Content-Type': 'application/json'
    }
    private static refreshQueue = new RefreshQueue();

    public static setHeaders(headers: Record<string, string>) {
        Http.headers = { ...Http.headers, ...headers }
    }

    public static deleteHeaders(...keys: string[]) {
        keys.forEach(key => delete Http.headers[key])
    }

    public static getHeaders(): Record<string, string> {
        return { ...Http.headers }
    }

    public static async useFetch(
        input: URL | Request | string,
        init?: RequestInit & ClientOptions
    ): Promise<Response> {
        let response = await fetch(input, {
            ...init,
            headers: Http.getHeaders(),
        })

        // 需要刷新 token
        if (response.headers.get(ACCESS_STATUS)) {
            await Http.refreshToken();
            // 使用新 token 重试
            response = await fetch(input, {
                ...init,
                headers: Http.getHeaders(),
            })
        }

        if (!response.ok) {
            throw new Error(`RequestError: ${response.status}`)
        }

        // 保存服务端返回的新 token
        const newRefresh = response.headers.get(REFRESH_HEADER)
        if (newRefresh) {
            await AppStore.SetValue(REFRESH_HEADER, newRefresh)
        }

        const newAccess = response.headers.get(ACCESS_HEADER)
        if (newAccess) {
            Http.setHeaders({ [ACCESS_HEADER]: `Bearer ${newAccess}` })
        }

        if (newRefresh || newAccess) {
            await AppStore.Save()
        }

        return response
    }

    public static async refreshToken(force: boolean = false): Promise<void> {
        return Http.refreshQueue.executeRefresh(async () => {
            const refreshToken = await AppStore.GetValue<string>(REFRESH_HEADER)
            if (!refreshToken) {
                throw new Error('No refresh token')
            }

            Http.setHeaders({ [REFRESH_HEADER]: refreshToken })

            const url = `${BaseURL}${API.Refresh}`
            const res = await fetch(url, {
                method: 'GET',
                headers: Http.getHeaders(),
            })

            if (!res.ok) {
                throw new Error(`Refresh failed: ${res.status}`)
            }

            const newRefresh = res.headers.get(REFRESH_HEADER)
            const newAccess = res.headers.get(ACCESS_HEADER)

            if (!newRefresh || !newAccess) {
                throw new Error('Incomplete token response')
            }

            await AppStore.SetValue(REFRESH_HEADER, newRefresh)
            Http.setHeaders({ [ACCESS_HEADER]: `Bearer ${newAccess}` })
            await AppStore.Save()
            Http.deleteHeaders(REFRESH_HEADER)
        }, force)
    }

    public static isRefreshValid(): boolean {
        return Http.refreshQueue.isRefreshValid()
    }
}