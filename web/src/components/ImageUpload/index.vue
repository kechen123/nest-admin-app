<template>
  <div class="image-upload-wrapper">
    <el-upload :file-list="fileList" :http-request="handleUpload" list-type="picture-card" :limit="limit"
      :on-remove="handleRemove" :before-upload="beforeUpload" :accept="accept" :disabled="disabled"
      :on-preview="handlePreview" :class="{ 'hide-upload': hideUploadArea }">
      <!-- 当 limit=1 且已有图片时，隐藏上传按钮 -->
      <el-icon v-if="showUploadButton">
        <Plus />
      </el-icon>
    </el-upload>

    <!-- 隐藏的文件输入框，用于替换功能 -->
    <input ref="fileInputRef" type="file" :accept="accept" style="display: none" @change="handleFileSelect" />
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { uploadApi } from '@/api/upload'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadRequestOptions } from 'element-plus'
import { ref, watch, computed } from 'vue'
import { getPreviewUrl, getRelativePath } from '@/utils/common'

interface Props {
  modelValue?: string | string[] // 图片相对路径（单张：string，多张：string[] 或逗号分隔的 string）
  limit?: number // 上传数量限制，默认 1
  accept?: string // 接受的文件类型，默认 'image/*'
  maxSize?: number // 最大文件大小（MB），默认 5
  disabled?: boolean // 是否禁用
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  limit: 1,
  accept: 'image/*',
  maxSize: 5,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  change: [url: string | string[]]
}>()

const fileList = ref<UploadFile[]>([])
const fileInputRef = ref<HTMLInputElement>()
// 维护文件 UID 到相对路径的映射
const pathMap = ref<Map<number, string>>(new Map())

// 判断 modelValue 的类型，并转换为数组格式
const parseModelValue = (value: string | string[] | undefined): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    // 如果是字符串，按逗号分隔
    return value.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

// 将图片路径数组转换为 modelValue 格式
// 如果 limit === 1，返回字符串；否则根据原始类型决定返回格式
const formatModelValue = (paths: string[]): string | string[] => {
  if (props.limit === 1) {
    // 单张图片，返回字符串
    return paths[0] || ''
  } else {
    // 多张图片，判断原始 modelValue 的类型
    const originalValue = props.modelValue
    if (Array.isArray(originalValue)) {
      // 如果原始是数组，返回数组
      return paths
    } else {
      // 如果原始是字符串，返回逗号分隔的字符串
      return paths.join(',')
    }
  }
}

// 计算是否显示上传按钮
const showUploadButton = computed(() => {
  if (props.limit === 1 && fileList.value.length >= 1) {
    return false
  }
  return fileList.value.length < props.limit
})

// 计算是否隐藏上传区域（当 limit=1 且已有图片时）
const hideUploadArea = computed(() => {
  return props.limit === 1 && fileList.value.length >= 1
})

// 监听 modelValue 变化，同步到 fileList
watch(
  () => props.modelValue,
  (value) => {
    const paths = parseModelValue(value)

    if (paths.length > 0) {
      // 将相对路径转换为完整 URL 用于预览
      const previewUrls = paths.map(path => getPreviewUrl(path))

      // 检查是否需要更新 fileList
      const currentPaths = Array.from(pathMap.value.values())
      const pathsChanged =
        paths.length !== currentPaths.length ||
        paths.some((path, index) => path !== currentPaths[index])

      if (pathsChanged) {
        pathMap.value.clear()
        fileList.value = paths.map((path, index) => {
          const uid = Date.now() + index
          pathMap.value.set(uid, path)
          return {
            uid,
            name: `image-${index + 1}`,
            url: previewUrls[index],
            status: 'success',
          } as UploadFile
        })
      }
    } else {
      // 如果路径为空，清空 fileList
      fileList.value = []
      pathMap.value.clear()
    }
  },
  { immediate: true }
)

// 上传前的验证
const beforeUpload = (file: File): boolean => {
  const isImage = file.type.startsWith('image/')
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB！`)
    return false
  }

  // 检查是否超过限制
  if (fileList.value.length >= props.limit) {
    ElMessage.error(`最多只能上传 ${props.limit} 张图片！`)
    return false
  }

  return true
}

// 自定义上传方法
const handleUpload = async (options: UploadRequestOptions) => {
  const { file } = options

  // 先添加文件到 fileList（状态为 uploading）
  const uid = file.uid || Date.now() + Math.random()
  const uploadingFile: UploadFile = {
    uid,
    name: file.name,
    status: 'uploading',
    percentage: 0,
  } as UploadFile

  if (props.limit === 1) {
    // 单张图片，替换
    fileList.value = [uploadingFile]
  } else {
    // 多张图片，追加
    fileList.value.push(uploadingFile)
  }

  try {
    const response = await uploadApi.uploadImage(file as File)
    // 将返回的 URL 转换为相对路径用于提交
    const relativePath = getRelativePath(response.url)

    // 更新 fileList 用于预览（使用完整 URL）
    const previewUrl = getPreviewUrl(relativePath)

    // 查找并更新文件项
    const fileIndex = fileList.value.findIndex(f => f.uid === uid)
    if (fileIndex > -1) {
      pathMap.value.set(uid, relativePath)
      fileList.value[fileIndex] = {
        ...fileList.value[fileIndex],
        uid,
        name: file.name,
        url: previewUrl,
        status: 'success',
      } as UploadFile
    }

    if (props.limit === 1) {
      // 单张图片，清空 pathMap 并重新设置
      pathMap.value.clear()
      pathMap.value.set(uid, relativePath)
    }

    // 获取所有图片的相对路径（按 fileList 顺序）
    const allPaths = fileList.value
      .map(f => pathMap.value.get(f.uid || 0))
      .filter(Boolean) as string[]

    // 更新 v-model
    const newValue = formatModelValue(allPaths)
    emit('update:modelValue', newValue)
    emit('change', newValue)
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '图片上传失败')
    // 上传失败，移除刚添加的文件
    const failedFileIndex = fileList.value.findIndex(f => f.uid === uid)
    if (failedFileIndex > -1) {
      pathMap.value.delete(uid)
      fileList.value.splice(failedFileIndex, 1)
    }

    // 如果单张图片上传失败，清空
    if (props.limit === 1) {
      fileList.value = []
      pathMap.value.clear()
      emit('update:modelValue', '')
    }
  }
}

// 删除图片
const handleRemove = (file: UploadFile) => {
  // 从 fileList 和 pathMap 中移除
  const uid = file.uid || 0
  pathMap.value.delete(uid)
  const index = fileList.value.findIndex(f => f.uid === uid)
  if (index > -1) {
    fileList.value.splice(index, 1)

    // 更新 modelValue
    const allPaths = fileList.value
      .map(f => pathMap.value.get(f.uid || 0))
      .filter(Boolean) as string[]
    const newValue = formatModelValue(allPaths)
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }
}

// 预览/替换图片（当 limit=1 时，点击图片触发替换）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handlePreview = (_file: UploadFile) => {
  // 如果 limit=1 且未禁用，点击图片时触发替换
  if (props.limit === 1 && !props.disabled) {
    fileInputRef.value?.click()
  }
}

// 处理文件选择（用于替换功能）
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件
  if (!beforeUpload(file)) {
    // 重置文件输入
    target.value = ''
    return
  }

  // 上传新文件
  try {
    const response = await uploadApi.uploadImage(file)
    // 将返回的 URL 转换为相对路径用于提交
    const relativePath = getRelativePath(response.url)

    // 更新 fileList 用于预览（使用完整 URL）
    const previewUrl = getPreviewUrl(relativePath)
    const uid = Date.now() + Math.random()
    pathMap.value.clear()
    pathMap.value.set(uid, relativePath)
    fileList.value = [
      {
        uid,
        name: file.name,
        url: previewUrl,
        status: 'success',
      } as UploadFile,
    ]

    // 更新 v-model（使用相对路径）
    const newValue = formatModelValue([relativePath])
    emit('update:modelValue', newValue)
    emit('change', newValue)
    ElMessage.success('图片替换成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '图片替换失败')
  } finally {
    // 重置文件输入
    target.value = ''
  }
}
</script>

<style scoped>
.image-upload-wrapper {
  display: inline-block;
}

:deep(.el-upload--picture-card) {
  width: 148px;
  height: 148px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 148px;
  height: 148px;
}

/* 当 limit=1 且已有图片时，完全隐藏上传区域 */
:deep(.hide-upload .el-upload--picture-card) {
  display: none !important;
}
</style>
