/**
 * 合成地图 marker 图片（本地背景 + 网络图片）
 * uni-app Vue3 + TS
 */

export interface MergeMarkerOptions {
  canvasId: string
  backgroundSrc: string // 本地图片路径
  foregroundSrc: string // 网络图片 URL
  size?: number // 最终图片尺寸，默认 120
  fgSize?: number // 前景图尺寸，默认 60
  id: string
}

function getImageInfo(src: string) {
  console.log('src', src)
  return new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
    uni.getImageInfo({
      src,
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

function imageToBase64Sync(imagePath: string) {
  try {
    const fs = wx.getFileSystemManager()

    // 读取图片文件，第二个参数指定编码为 base64
    const fileData = fs.readFileSync(imagePath, 'base64')

    // 根据图片类型构造 data URL
    // 注意：需要知道图片的实际类型
    let mimeType = 'image/png'
    if (imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg')) {
      mimeType = 'image/jpeg'
    }
    else if (imagePath.endsWith('.gif')) {
      mimeType = 'image/gif'
    }

    // 拼接成完整的 base64 URL
    const base64Url = `data:${mimeType};base64,${fileData}`
    return base64Url
  }
  catch (error) {
    console.error('读取图片失败:', error)
    return null
  }
}

export async function mergeMarkerImage(
  options: MergeMarkerOptions,
): Promise<{ id: string, tempFilePath: string }> {
  const {
    canvasId,
    backgroundSrc,
    foregroundSrc,
    size = 120,
    fgSize = 60,
    id,
  } = options

  const bgRes = await imageToBase64Sync(backgroundSrc)
  const fgRes = await getImageInfo(foregroundSrc)
  console.log('fgRes', fgRes)
  console.log('bgRes', bgRes)
  const ctx = uni.createCanvasContext(canvasId)
  ctx.setFillStyle('#3B61F2')
  ctx.fillRect(0, 0, 100, 100)
  // 清空画布
  ctx.clearRect(0, 0, size * 2, size * 2)

  // 2️⃣ 画背景图
  ctx.drawImage(bgRes, 0, 0, size * 2, size * 2)

  // 3️⃣ 裁剪成圆形（前景图）- 顶部距离4px，左右居中
  const x = (size * 2 - size) / 2 // 左右居中
  const y = 8 // 顶部距离
  const r = size / 2 // 圆形半径

  ctx.save()
  ctx.beginPath()
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(fgRes.path, x, y, size, size)
  ctx.restore()

  return new Promise((resolve, reject) => {
    ctx.draw(true, () => {
      uni.canvasToTempFilePath({
        canvasId,
        width: size * 2,
        height: size * 2,
        destWidth: size * 2,
        destHeight: size * 2,
        success(res) {
          console.log('res', res)
          resolve({
            id,
            tempFilePath: res.tempFilePath,
          })
        },
        fail(err) {
          reject(err)
        },
      })
    })
  })
}
