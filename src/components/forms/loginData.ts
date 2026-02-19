import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { useSettings } from '@/lib/state'
import { API,BaseURL } from '@/assets/default.json'
import {Http} from "@/lib";

const { updateUser } = useSettings()
const LoginFields = () => {
    const formSchema = toTypedSchema(
        z.object({
            email: z.email("邮箱格式错误").nonempty("邮箱不能为空"),
            password: z.string("密码必填").min(6, "密码长度不能小于6位").max(32, "密码长度不能大于32位").nonempty("密码不能为空"),
        })
    )
    return useForm({
        validationSchema: formSchema,
    })
}

const RegisterFields = () => {
    const formSchema = toTypedSchema(z.object({
        email:z.email("邮箱格式错误").nonempty('请输入邮箱'),
        name:z.string().min(3,'用户名必须至少包含 3 个字符').max(32,'用户名不能超过 32 个字符'),
        password:z.string("密码必填").min(6,'密码必须至少包含 6 个字符').max(32,'密码不能超过 32 个字符'),
        confirmPassword:z.string().optional(),
        verifyCode:z.string().length(6,'验证码必须包含 6 个字符')
    }).refine(data => data.password === data.confirmPassword,{
        message:'密码不一致',
        path:['confirmPassword'],
    }))
    return useForm({
        validationSchema: formSchema,
    })
}

const sendVerifyCode = async (sendData:{email: string,userName: string}) => {
    try {
        let url = `${BaseURL}${API.VERIFICATIONS}`
        let res = await Http.useFetch(url,
            {
                method: 'POST',
                body:JSON.stringify(sendData),
                headers: Http.getHeaders()
            })
        const response = await res.json()
        if(!res.ok || response.code !== 0)
            throw new Error(response.message) 
    } catch (error: any) {
        throw new Error(error.message || String(error))
    }
}
const register = async (register:{
    email:string,
    userName:string,
    password:string,
    verifyCode:string
}) =>{
    try {
        let url = `${BaseURL}${API.REGISTER}`
        let res = await Http.useFetch(url,{
            method: 'POST',
            headers: Http.getHeaders(),
            body:JSON.stringify(register)
        })
        const response = await res.json()
        if(!res.ok || response.code !== 0)
            throw new Error(response.message)
    } catch (err:any) {
        throw new Error(err.message || String(err))
    }
}

const login = async (login:{email:string,password:string}) =>{
    try {
        let url = `${BaseURL}${API.LOGIN}`
        let res = await Http.useFetch(url,{
            method: 'POST',
            headers: Http.getHeaders(),
            body:JSON.stringify(login)
        })
        const response = await res.json()
        if(response.code !== 0)
            throw new Error(response.message)
        await updateUser({
            UUID:response.data.uuid,
            UserName:response.data.userName,
            Email:response.data.email,
            Avatar:response.data.avatar,
            Role:response.data.role,
        })
    } catch (error: any){
        throw new Error(error.message || String(error))
    }
}

export { LoginFields, RegisterFields,sendVerifyCode,register, login}