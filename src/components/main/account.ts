import { BaseURL, API } from '@/assets/default.json'
import { Http } from "@/lib";

export const logout = async () => {
  let url = `${BaseURL}${API.LOGOUT}`
  let res = await Http.useFetch(url, {
    method: 'GET',
  })
  let response = await res.json()
  if (!res.ok || response.code !== 0) {
    throw new Error(response.message)
  }
}
