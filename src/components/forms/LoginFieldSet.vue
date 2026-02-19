<script setup lang="ts">
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { LoginFields,login as sendLogin } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { useDebounceFn } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';

const router = useRouter()

const { defineField,errors, handleReset, handleSubmit } = LoginFields()
const [email,emailAttrs] = defineField('email',{validateOnBlur:true})
const [password,passwordAttrs] = defineField('password',{validateOnBlur:true})

const login = useDebounceFn(handleSubmit(async (values) =>{
    try {
        await sendLogin({
            email:values.email,
            password:values.password
        })
        router.push('/main')
        toast.success('登录成功')
    } catch (error:any) {
        toast.error(error.message || String(error))
    }
}),1000,{maxWait:5000})
</script>
<template>
    <FieldSet>
        <Field data-invalid>
            <FieldLabel for="email">邮箱</FieldLabel>
            <Input v-model="email" id="email" type="email" placeholder="请输入邮箱" aria-invalid v-bind="emailAttrs" />
            <FieldError :errors="[errors.email]"></FieldError>
        </Field>
        <Field data-invalid>
            <FieldLabel for="password">密码</FieldLabel>
            <Input v-model="password" id="password" type="password" placeholder="请输入密码" aria-invalid v-bind="passwordAttrs" />
            <FieldError :errors="[errors.password]"></FieldError>
        </Field>
        <Field orientation="horizontal" class=" justify-center-safe">
            <Button @click="login">登录</Button>
            <Button variant="outline" @click="handleReset">重置</Button>
        </Field>
    </FieldSet>
</template>