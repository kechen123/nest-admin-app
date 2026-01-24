import type { ICheckinRecord } from '@/api/checkin'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as checkinApi from '@/api/checkin'

// 打卡记录类型（兼容后端和本地）
export interface CheckinRecord {
  id: string | number
  latitude: number // 纬度
  longitude: number // 经度
  address: string // 地址
  content: string // 打卡内容
  images: string[] // 图片列表
  isPublic?: boolean | number // 是否公开
  createTime: string // 创建时间
  updateTime: string // 更新时间
  createdAt?: string // 后端字段
  updatedAt?: string // 后端字段
}

export const useCheckinStore = defineStore(
  'checkin',
  () => {
    // 打卡记录列表
    const records = ref<CheckinRecord[]>([])
    const loading = ref(false)

    // 转换后端数据格式为前端格式
    const transformRecord = (record: ICheckinRecord): CheckinRecord => {
      return {
        id: record.id,
        latitude: Number(record.latitude),
        longitude: Number(record.longitude),
        address: record.address,
        content: record.content || '',
        images: record.images || [],
        isPublic: record.isPublic !== undefined ? Boolean(record.isPublic) : false,
        createTime: record.createdAt || record.createdAt || '',
        updateTime: record.updatedAt || record.updatedAt || '',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }
    }

    // 从后端加载打卡记录列表
    const loadRecords = async (page = 1, pageSize = 100) => {
      try {
        loading.value = true
        const res = await checkinApi.getCheckinList({ page, pageSize })
        records.value = res.list.map(transformRecord)
        return res
      }
      catch (error) {
        console.error('加载打卡记录失败:', error)
        throw error
      }
      finally {
        loading.value = false
      }
    }

    // 添加打卡记录（调用后端API）
    const addRecord = async (record: Omit<CheckinRecord, 'id' | 'createTime' | 'updateTime' | 'createdAt' | 'updatedAt'>) => {
      try {
        const res = await checkinApi.createCheckin({
          latitude: record.latitude,
          longitude: record.longitude,
          address: record.address,
          content: record.content,
          images: record.images,
          isPublic: record.isPublic,
        })
        const newRecord = transformRecord(res)
        records.value.unshift(newRecord) // 最新的在前面
        return newRecord
      }
      catch (error) {
        console.error('创建打卡记录失败:', error)
        // 如果API调用失败，回退到本地存储
        const newRecord: CheckinRecord = {
          ...record,
          id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }
        records.value.unshift(newRecord)
        return newRecord
      }
    }

    // 删除打卡记录（调用后端API）
    const deleteRecord = async (id: string | number) => {
      try {
        await checkinApi.deleteCheckin(Number(id))
        const index = records.value.findIndex(item => item.id === id)
        if (index > -1) {
          records.value.splice(index, 1)
          return true
        }
        return false
      }
      catch (error) {
        console.error('删除打卡记录失败:', error)
        // 如果API调用失败，回退到本地删除
        const index = records.value.findIndex(item => item.id === id)
        if (index > -1) {
          records.value.splice(index, 1)
          return true
        }
        return false
      }
    }

    // 更新打卡记录（调用后端API）
    const updateRecord = async (id: string | number, record: Partial<Omit<CheckinRecord, 'id' | 'createTime' | 'updateTime'>>) => {
      try {
        const res = await checkinApi.updateCheckin(Number(id), {
          latitude: record.latitude,
          longitude: record.longitude,
          address: record.address,
          content: record.content,
          images: record.images,
        })
        const updatedRecord = transformRecord(res)
        const index = records.value.findIndex(item => item.id === id)
        if (index > -1) {
          records.value[index] = updatedRecord
          return true
        }
        return false
      }
      catch (error) {
        console.error('更新打卡记录失败:', error)
        // 如果API调用失败，回退到本地更新
        const index = records.value.findIndex(item => item.id === id)
        if (index > -1) {
          records.value[index] = {
            ...records.value[index],
            ...record,
            updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          }
          return true
        }
        return false
      }
    }

    // 根据ID获取打卡记录（优先从本地查找，找不到则调用API）
    const getRecordById = async (id: string | number) => {
      let record = records.value.find(item => item.id === id)
      if (!record) {
        try {
          const res = await checkinApi.getCheckinDetail(Number(id))
          record = transformRecord(res)
          // 如果不在列表中，添加到列表
          if (!records.value.find(item => item.id === record.id)) {
            records.value.push(record)
          }
        }
        catch (error) {
          console.error('获取打卡记录详情失败:', error)
        }
      }
      return record
    }

    // 获取所有打卡记录（按时间倒序）
    const getAllRecords = () => {
      return records.value.sort((a, b) => {
        const timeA = a.createdAt || a.createTime
        const timeB = b.createdAt || b.createTime
        return new Date(timeB).getTime() - new Date(timeA).getTime()
      })
    }

    // 获取统计信息（调用后端API）
    const getStatistics = async () => {
      try {
        return await checkinApi.getCheckinStatistics()
      }
      catch (error) {
        console.error('获取统计信息失败:', error)
        // 如果API调用失败，使用本地数据计算
        const total = records.value.length
        const thisMonth = records.value.filter((record) => {
          const time = record.createdAt || record.createTime
          return dayjs(time).month() === dayjs().month()
            && dayjs(time).year() === dayjs().year()
        }).length
        const thisWeek = records.value.filter((record) => {
          const time = record.createdAt || record.createTime
          return dayjs(time).isAfter(dayjs().startOf('week'))
        }).length
        return { total, thisMonth, thisWeek }
      }
    }

    return {
      records,
      loading,
      loadRecords,
      addRecord,
      deleteRecord,
      updateRecord,
      getRecordById,
      getAllRecords,
      getStatistics,
    }
  },
  {
    persist: true,
  },
)
