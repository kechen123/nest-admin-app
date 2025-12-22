<template>
  <div class="image-upload-wrapper">
    <el-upload v-model:file-list="fileList" :http-request="handleUpload" list-type="picture-card" :limit="limit"
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
  modelValue?: string // 图片相对路径（如 /uploads/images/xxx.png）
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
  'update:modelValue': [value: string]
  change: [url: string]
}>()

const fileList = ref<UploadFile[]>([])
const fileInputRef = ref<HTMLInputElement>()

// 计算是否显示上传按钮
// 当 limit=1 且已有图片时，不显示上传按钮
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
  (path) => {
    if (path) {
      // 将相对路径转换为完整 URL 用于预览
      const previewUrl = getPreviewUrl(path)
      // 如果 URL 存在且与当前 fileList 中的 URL 不同，则更新
      const currentUrl = fileList.value[0]?.url
      if (currentUrl !== previewUrl) {
        fileList.value = [
          {
            name: 'image',
            url: previewUrl,
            status: 'success',
          } as UploadFile,
        ]
      }
    } else {
      // 如果 URL 为空，清空 fileList
      fileList.value = []
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
  return true
}

// 自定义上传方法
const handleUpload = async (options: UploadRequestOptions) => {
  const { file } = options

  try {
    const response = await uploadApi.uploadImage(file as File)
    // 将返回的 URL 转换为相对路径用于提交
    const relativePath = getRelativePath(response.url)

    // 更新 fileList 用于预览（使用完整 URL）
    const previewUrl = getPreviewUrl(relativePath)
    fileList.value = [
      {
        name: file.name,
        url: previewUrl,
        status: 'success',
      } as UploadFile,
    ]

    // 更新 v-model（使用相对路径）
    emit('update:modelValue', relativePath)
    emit('change', relativePath)
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '图片上传失败')
    // 上传失败，移除文件
    fileList.value = []
    emit('update:modelValue', '')
  }
}

// 删除图片
const handleRemove = () => {
  emit('update:modelValue', '')
  emit('change', '')
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
    fileList.value = [
      {
        name: file.name,
        url: previewUrl,
        status: 'success',
      } as UploadFile,
    ]

    // 更新 v-model（使用相对路径）
    emit('update:modelValue', relativePath)
    emit('change', relativePath)
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
