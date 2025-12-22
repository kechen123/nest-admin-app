import axios from '@/utils/http/axios'

export interface UploadImageResponse {
  url: string
  path: string
  filename: string
  originalname: string
  mimetype: string
  size: number
}

// 文件上传 API
export const uploadApi = {
  /**
   * 上传图片
   * @param file 图片文件
   */
  uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    return axios.post<UploadImageResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

