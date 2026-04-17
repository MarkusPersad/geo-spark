import { invoke } from "@tauri-apps/api/core"
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getClientIP = async () => {
  try {
    return (await invoke('get_client_ip')) as string
  } catch (err: any) {
    throw Error(err.message || String(err))
  }
}
