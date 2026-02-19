<script setup lang="ts">
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { RegisterFields,sendVerifyCode,register as sendRegister } from '@/components/forms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounceFn } from '@vueuse/core'
import { onUnmounted, ref, Ref } from 'vue';
import { toast } from 'vue-sonner'

const toggle = defineModel<boolean>('toggle')

const { defineField, errors, handleReset, validateField, handleSubmit } = RegisterFields()

const [name,nameAttrs] = defineField('name',{validateOnBlur:true})
const [email,emailAttrs] = defineField('email',{validateOnBlur:true})
const [password,passwordAttrs] = defineField('password',{validateOnBlur:true})
const [confirm,confirmAttrs] = defineField('confirmPassword',{validateOnBlur:true})
const [verify,verifyAttrs] = defineField('verifyCode',{validateOnBlur:true})

const countDown:Ref<number> = ref(0)
let countDownInterval: number | null = null
const startCountDown = () =>{
  countDown.value = 60
  countDownInterval = window.setInterval(()=>{
    countDown.value--
    if (countDown.value <= 0 && countDownInterval){
      window.clearInterval(countDownInterval)
    }
  },1000) as unknown as number
}

const VerifyCode = useDebounceFn(async () =>{
    try {
        await validateField('email')
        await validateField('name')
        if (email.value && name.value){
            await sendVerifyCode({
                email:email.value,
                userName:name.value
            })
            if (countDown.value <= 0){
                startCountDown()
            }
        }
    } catch(error: any) {
        toast.error(error.message || String(error))
    }
},1000,{maxWait:5000})
const register = useDebounceFn(handleSubmit(async (values) =>{
    try {
        await sendRegister({
            email:values.email,
            userName:values.name,
            password:values.password,
            verifyCode:values.verifyCode
        })
        toast.success('注册成功')
        toggle.value = true
    } catch(error: any) {
        toast.error(error.message || String(error))
    }
}),1000,{maxWait:5000})
onUnmounted(() =>{
    if (countDownInterval){
        window.clearInterval(countDownInterval)
    }
})
</script>
<template>
    <FieldSet>
        <Field data-invalid>
            <FieldLabel for="name">用户名</FieldLabel>
            <Input v-model="name" id="name" typr="text" placeholder="请输入用户名" aria-invalid v-bind="nameAttrs" />
            <FieldError :errors="[errors.name]"></FieldError>
        </Field>
        <Field data-invalid>
            <FieldLabel for="email">邮箱</FieldLabel>
            <Input v-model="email" type="email" id="email" placeholder="请输入邮箱" v-bind="emailAttrs" aria-invalid />
            <FieldError :errors="[errors.email]"></FieldError>
        </Field>
        <Field data-invalid>
            <FieldLabel for="password">密码</FieldLabel>
            <Input v-model="password" type="password" id="password" placeholder="请输入密码" v-bind="passwordAttrs" aria-invalid />
            <FieldError :errors="[errors.password]"></FieldError>
        </Field>
        <Field data-invalid>
            <FieldLabel for="confirm">确认密码</FieldLabel>
            <Input v-model="confirm" type="password" id="confirm" placeholder="请输入确认密码" v-bind="confirmAttrs" aria-invalid />
            <FieldError :errors="[errors.confirmPassword]"></FieldError>
        </Field>
        <Field data-invalid>
            <FieldLabel for="verify">验证码</FieldLabel>
            <div  class=" ds-join gap-2" id="verify">
                <Input v-model="verify" type="text" placeholder="请输入验证码" aria-invalid v-bind="verifyAttrs" />
                <Button
                @click="VerifyCode"
                :disabled="countDown > 0 ||!email||!name"
                >{{countDown > 0 ? `${countDown}s` : '发送验证码'}}</Button>
            </div>
            <FieldError :errors="[errors.verifyCode]"></FieldError>
        </Field>
        <Field orientation="horizontal" class="justify-center-safe">
            <Button
                @click="register"
            >注册</Button>
            <Button variant="outline" @click="handleReset">重置</Button>
        </Field>
    </FieldSet>
</template>