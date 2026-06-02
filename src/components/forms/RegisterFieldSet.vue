<script setup lang="ts">
import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { RegisterFields, sendVerifyCode, register as sendRegister } from '@/components/forms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounceFn } from '@vueuse/core'
import { onUnmounted, ref, computed, type Ref } from 'vue';
import { toast } from 'vue-sonner'

const toggle = defineModel<boolean>('toggle')

const { defineField, errors, handleReset, validateField, handleSubmit } = RegisterFields()

const [name, nameAttrs] = defineField('name', { validateOnBlur: true })
const [email, emailAttrs] = defineField('email', { validateOnBlur: true })
const [password, passwordAttrs] = defineField('password', { validateOnBlur: true })
const [confirm, confirmAttrs] = defineField('confirmPassword', { validateOnBlur: true })
const [verify, verifyAttrs] = defineField('verifyCode', { validateOnBlur: true })

// 倒计时逻辑
const countDown: Ref<number> = ref(0)
let countDownInterval: number | null = null

const startCountDown = () => {
  countDown.value = 60
  countDownInterval = window.setInterval(() => {
    countDown.value--
    if (countDown.value <= 0 && countDownInterval) {
      window.clearInterval(countDownInterval)
    }
  }, 1000) as unknown as number
}

// 核心优化：计算属性判断发送验证码按钮是否应该被禁用
// 规则：正在倒计时 OR 任意一项没填 OR 前四项中存在任何一个校验错误
const isVerifyDisabled = computed(() => {
  // 1. 如果正在倒计时，直接禁用
  if (countDown.value > 0) return true

  // 2. 检查前四项是否填了值（非空检查）
  const hasEmptyFields = !name.value || !email.value || !password.value || !confirm.value

  // 3. 检查前四项是否存在校验错误
  const hasErrors = !!errors.value.name || 
                    !!errors.value.email || 
                    !!errors.value.password || 
                    !!errors.value.confirmPassword

  // 只要没填满，或者有报错，就保持禁用
  return hasEmptyFields || hasErrors
})

// 发送验证码
const VerifyCode = useDebounceFn(async () => {
  try {
    // 再次显式触发前置核心字段的校验（防止漏网之鱼）
    const isEmailValid = await validateField('email')
    const isNameValid = await validateField('name')

    // 严谨的双重检查：必须全部校验成功，且输入框都有值
    if (
      isEmailValid && 
      isNameValid && 
      !errors.value.email && 
      !errors.value.name && 
      !errors.value.password && 
      !errors.value.confirmPassword &&
      email.value && 
      name.value
    ) {
      // 使用非空断言修饰，解决 TS 编译报错问题
      await sendVerifyCode({
        email: email.value!,
        userName: name.value!
      })
      toast.success('验证码已发送')
      if (countDown.value <= 0) {
        startCountDown()
      }
    }
  } catch (error: any) {
    toast.error(error.message || String(error))
  }
}, 1000, { maxWait: 5000 })

// 注册提交
const register = useDebounceFn(handleSubmit(async (values) => {
  try {
    await sendRegister({
      email: values.email,
      userName: values.name,
      password: values.password,
      verifyCode: values.verifyCode
    })
    toast.success('注册成功')
    toggle.value = true
  } catch (error: any) {
    toast.error(error.message || String(error))
  }
}), 1000, { maxWait: 5000 })

// 销毁时清理定时器
onUnmounted(() => {
  if (countDownInterval) {
    window.clearInterval(countDownInterval)
  }
})
</script>

<template>
  <FieldSet>
    <Field :data-invalid="!!errors.name">
      <FieldLabel for="name">用户名</FieldLabel>
      <Input 
        v-model="name" 
        id="name" 
        type="text" 
        placeholder="请输入用户名" 
        :aria-invalid="!!errors.name" 
        v-bind="nameAttrs" 
      />
      <FieldError :errors="[errors.name]"></FieldError>
    </Field>

    <Field :data-invalid="!!errors.email">
      <FieldLabel for="email">邮箱</FieldLabel>
      <Input 
        v-model="email" 
        type="email" 
        id="email" 
        placeholder="请输入邮箱" 
        :aria-invalid="!!errors.email" 
        v-bind="emailAttrs" 
      />
      <FieldError :errors="[errors.email]"></FieldError>
    </Field>

    <Field :data-invalid="!!errors.password">
      <FieldLabel for="password">密码</FieldLabel>
      <Input 
        v-model="password" 
        type="password" 
        id="password" 
        placeholder="请输入密码" 
        :aria-invalid="!!errors.password" 
        v-bind="passwordAttrs" 
      />
      <FieldError :errors="[errors.password]"></FieldError>
    </Field>

    <Field :data-invalid="!!errors.confirmPassword">
      <FieldLabel for="confirm">确认密码</FieldLabel>
      <Input 
        v-model="confirm" 
        type="password" 
        id="confirm" 
        placeholder="请输入确认密码" 
        :aria-invalid="!!errors.confirmPassword" 
        v-bind="confirmAttrs" 
      />
      <FieldError :errors="[errors.confirmPassword]"></FieldError>
    </Field>

    <Field :data-invalid="!!errors.verifyCode">
      <FieldLabel for="verify">验证码</FieldLabel>
      <div class="flex flex-row gap-2" id="verify">
        <Input 
          v-model="verify" 
          type="text" 
          placeholder="请输入验证码" 
          :aria-invalid="!!errors.verifyCode" 
          v-bind="verifyAttrs" 
        />
        <Button
          type="button"
          @click="VerifyCode"
          :disabled="isVerifyDisabled"
        >
          {{ countDown > 0 ? `${countDown}s` : '发送验证码' }}
        </Button>
      </div>
      <FieldError :errors="[errors.verifyCode]"></FieldError>
    </Field>

    <Field orientation="horizontal" class="justify-center-safe gap-4">
      <Button @click="register">注册</Button>
      <Button variant="outline" type="button" @click="handleReset">重置</Button>
    </Field>
  </FieldSet>
</template>