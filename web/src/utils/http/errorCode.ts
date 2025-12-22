export const errorCodeType = function (code: string): string {
  let errMessage: string = '未知错误'
  switch (code) {
    // case 202:
    //   errMessage = '查无结果'
    //   break
    case 301:
      errMessage = '输入参数错误'
      break
    case 404:
      errMessage = '获取资源不存在'
      break
    case 415:
      errMessage = '文件上传失败'
      break
    case 400:
      errMessage = '授权错误或失效'
      break
    case 411:
      errMessage = '密码错误'
      break
    case 412:
      errMessage = '用户名错误或不存在'
      break
    case 413:
      errMessage = '权限不够'
      break
    case 414:
      errMessage = '用户不存在'
      break
    case 500:
      errMessage = '发生异常'
      break
    case 701:
      errMessage = '数据库连接失败'
      break
    case 702:
      errMessage = '数据库操作失败'
      break
    default:
      errMessage = `其他连接错误 --${code}`
  }
  return errMessage
}
