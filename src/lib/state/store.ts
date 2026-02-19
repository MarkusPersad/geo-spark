import { LazyStore } from "@tauri-apps/plugin-store";

export class AppStore {
    private static instance : LazyStore = new LazyStore('settings.json')
    public static async SetValue(key: string, value: any) {
        return await AppStore.instance.set(key, value)
    }
    public static async GetValue<T>(key: string): Promise<T | undefined> {
        return await AppStore.instance.get<T>(key)
    }
    public static async Save() {
        return await AppStore.instance.save()
    }
    
}