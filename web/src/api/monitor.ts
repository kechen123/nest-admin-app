import axios from '@/utils/http/axios'

export interface ServerInfo {
  cpu: {
    num: number
    model: string
    usage: number
  }
  mem: {
    total: number
    used: number
    free: number
    usage: number
  }
  sys: {
    computerName: string
    computerIp: string
    osName: string
    osArch: string
  }
  jvm: {
    name: string
    version: string
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
}

export const monitorApi = {
  // 获取服务器信息
  getServerInfo() {
    return axios.get<ServerInfo>('/monitor/server')
  },
}

