import { defineStore } from "pinia";
import { IONTOKEN } from '@/assets/default.json'
import {ref, Ref, toRef, watch} from "vue";
import { AppStore } from "./store";
import {Ion} from "cesium";

interface Settings {
    IonToken: string,
    User:User
}

interface User {
        UUID: string
        UserName: string
        Email: string
        Avatar: string
        Role: string,
    }
export const useSettings = defineStore('settings', () =>{
    const settings:Ref<Settings|undefined> = ref()
    const getSettings = async () =>{
        if(!settings.value){
            settings.value = {
                IonToken: await AppStore.GetValue<string>('IonToken') || IONTOKEN,
                User: await AppStore.GetValue<User>('User') || {
                    UUID: '',
                    UserName: '',
                    Email: '',
                    Avatar: '',
                    Role: ''
                }
            }
        }
        return settings.value
    }
    const updateUser =  async (user:Partial<User>) =>{
        if(!settings.value){
            await getSettings()
        } 
        if(settings.value) {
            settings.value.User = {
                ...settings.value.User,
                ...user
            }
            await AppStore.SetValue('User',settings.value.User)
            await AppStore.Save()
        }
    }

    const updateSettings = async (fields:Partial<Omit<Settings,'User'>>) =>{
        if(!settings.value){
            await getSettings()
        } 
        if(settings.value){
            settings.value = {
                ...settings.value,
                ...fields
            }
            for (const [key1, value1] of Object.entries(fields).filter(([key, value]) => value || key !== 'User')) {
                await AppStore.SetValue(key1,value1)
            }
        }
        await AppStore.Save()
    }
    watch(() => toRef(settings.value?.IonToken),  (newValue) =>{
       if (newValue.value){
           Ion.defaultAccessToken = newValue.value
       }
    },{immediate: true})
    return {
        getSettings,
        updateUser,
        updateSettings,
    }
})