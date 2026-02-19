<script setup lang="ts">
import { LoginFieldSet, RegisterFieldSet } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardAction, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import {ref} from 'vue';
import {cn} from "@/lib";

const isLogin = ref(true);


</script>
<template>
    <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Toaster position="top-center" rich-colors />
      <div :class="cn('flex flex-col gap-6', 'w-full max-w-sm')">
        <Card>
          <CardHeader>
            <CardTitle>{{ isLogin? '登录':'注册' }}</CardTitle>
            <CardAction>
              <Button @click="isLogin = ! isLogin">{{ isLogin? '前去注册':'已有账号' }}</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <LoginFieldSet v-if="isLogin" />
            <RegisterFieldSet v-model:toggle="isLogin" v-else />
          </CardContent>
        </Card>
      </div>
  </div>
</template>