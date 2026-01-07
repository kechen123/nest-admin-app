/**
 * 滑动面板工具函数
 */
import { ElMessageBox } from 'element-plus'

/**
 * 显示未保存修改的确认对话框
 */
export async function showUnsavedChangesDialog(): Promise<boolean> {
  try {
    await ElMessageBox.confirm(
      '您有未保存的修改，确定要关闭吗？',
      '提示',
      {
        confirmButtonText: '确定关闭',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    return true
  } catch {
    return false
  }
}
