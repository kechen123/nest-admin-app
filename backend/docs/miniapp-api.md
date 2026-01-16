# 小程序恋爱打卡系统 API 文档

## 基础信息

- **Base URL**: `/api/miniapp`
- **认证方式**: JWT Bearer Token（除登录接口外）

## 接口列表

### 1. 用户相关接口

#### 1.1 微信登录/注册

**接口地址**: `POST /miniapp/user/wxLogin`

**接口描述**: 微信小程序登录，如果用户不存在则自动注册

**请求参数**:
```json
{
  "code": "081abc123def456",  // 微信登录code
  "userInfo": {                // 可选，用户信息
    "nickName": "用户昵称",
    "avatarUrl": "https://xxx.com/avatar.jpg",
    "gender": 1                // 0-未知, 1-男, 2-女
  }
}
```

**响应示例**:
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "id": 1,
    "openid": "oUpF8uMuAJO_M2pxb1Q9zNjWeS6o",
    "nickname": "用户昵称",
    "avatar": "https://xxx.com/avatar.jpg",
    "gender": 1
  }
}
```

#### 1.2 获取用户信息

**接口地址**: `GET /miniapp/user/:id`

**接口描述**: 根据用户ID获取用户信息

**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "id": 1,
  "openid": "oUpF8uMuAJO_M2pxb1Q9zNjWeS6o",
  "nickname": "用户昵称",
  "avatar": "https://xxx.com/avatar.jpg",
  "gender": 1,
  "status": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. 用户绑定相关接口

#### 2.1 绑定另一半

**接口地址**: `POST /miniapp/couple/bind`

**接口描述**: 绑定另一半用户

**请求头**: `Authorization: Bearer {token}`

**请求参数**:
```json
{
  "partnerId": 2  // 另一半的用户ID
}
```

**响应示例**:
```json
{
  "id": 1,
  "userId": 1,
  "partnerId": 2,
  "status": 1,
  "bindTime": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2.2 解除绑定

**接口地址**: `DELETE /miniapp/couple/unbind`

**接口描述**: 解除绑定关系

**请求头**: `Authorization: Bearer {token}`

**请求参数**:
```json
{
  "coupleId": 1  // 绑定关系ID
}
```

**响应示例**:
```json
{
  "message": "解除绑定成功"
}
```

#### 2.3 获取绑定信息

**接口地址**: `GET /miniapp/couple/info`

**接口描述**: 获取当前用户的绑定信息

**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "id": 1,
  "userId": 1,
  "partnerId": 2,
  "status": 1,
  "bindTime": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": 1,
    "nickname": "用户1",
    "avatar": "https://xxx.com/avatar1.jpg"
  },
  "partner": {
    "id": 2,
    "nickname": "用户2",
    "avatar": "https://xxx.com/avatar2.jpg"
  }
}
```

#### 2.4 获取另一半信息

**接口地址**: `GET /miniapp/couple/partner`

**接口描述**: 获取另一半的用户信息

**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "id": 2,
  "openid": "oUpF8uMuAJO_M2pxb1Q9zNjWeS6o",
  "nickname": "另一半昵称",
  "avatar": "https://xxx.com/avatar.jpg",
  "gender": 2
}
```

---

### 3. 打卡记录相关接口

#### 3.1 创建打卡记录

**接口地址**: `POST /miniapp/checkin`

**接口描述**: 创建新的打卡记录

**请求头**: `Authorization: Bearer {token}`

**请求参数**:
```json
{
  "latitude": 39.908823,      // 纬度
  "longitude": 116.397470,     // 经度
  "address": "北京市朝阳区xxx街道",  // 地址描述
  "content": "今天在这里约会，很开心！",  // 打卡内容（可选）
  "images": [                  // 图片列表（可选）
    "https://xxx.com/image1.jpg",
    "https://xxx.com/image2.jpg"
  ]
}
```

**响应示例**:
```json
{
  "id": 1,
  "userId": 1,
  "latitude": 39.908823,
  "longitude": 116.397470,
  "address": "北京市朝阳区xxx街道",
  "content": "今天在这里约会，很开心！",
  "images": [
    "https://xxx.com/image1.jpg",
    "https://xxx.com/image2.jpg"
  ],
  "status": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3.2 分页查询打卡记录

**接口地址**: `GET /miniapp/checkin`

**接口描述**: 分页查询打卡记录列表

**请求头**: `Authorization: Bearer {token}`

**查询参数**:
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认10，最大100
- `startDate`: 开始日期（YYYY-MM-DD），可选
- `endDate`: 结束日期（YYYY-MM-DD），可选

**响应示例**:
```json
{
  "list": [
    {
      "id": 1,
      "userId": 1,
      "latitude": 39.908823,
      "longitude": 116.397470,
      "address": "北京市朝阳区xxx街道",
      "content": "今天在这里约会，很开心！",
      "images": ["https://xxx.com/image1.jpg"],
      "status": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

#### 3.3 获取打卡统计

**接口地址**: `GET /miniapp/checkin/statistics`

**接口描述**: 获取当前用户的打卡统计信息

**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "total": 100,      // 总打卡数
  "thisMonth": 10,   // 本月打卡数
  "thisWeek": 3      // 本周打卡数
}
```

#### 3.4 获取打卡记录详情

**接口地址**: `GET /miniapp/checkin/:id`

**接口描述**: 根据ID获取打卡记录详情

**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "id": 1,
  "userId": 1,
  "latitude": 39.908823,
  "longitude": 116.397470,
  "address": "北京市朝阳区xxx街道",
  "content": "今天在这里约会，很开心！",
  "images": [
    "https://xxx.com/image1.jpg",
    "https://xxx.com/image2.jpg"
  ],
  "status": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": 1,
    "nickname": "用户昵称",
    "avatar": "https://xxx.com/avatar.jpg"
  }
}
```

#### 3.5 更新打卡记录

**接口地址**: `PATCH /miniapp/checkin/:id`

**接口描述**: 更新打卡记录

**请求头**: `Authorization: Bearer {token}`

**请求参数**（所有字段可选）:
```json
{
  "latitude": 39.908823,
  "longitude": 116.397470,
  "address": "北京市朝阳区xxx街道",
  "content": "更新后的内容",
  "images": ["https://xxx.com/image1.jpg"]
}
```

**响应示例**:
```json
{
  "id": 1,
  "userId": 1,
  "latitude": 39.908823,
  "longitude": 116.397470,
  "address": "北京市朝阳区xxx街道",
  "content": "更新后的内容",
  "images": ["https://xxx.com/image1.jpg"],
  "status": 1,
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

#### 3.6 删除打卡记录

**接口地址**: `DELETE /miniapp/checkin/:id`

**接口描述**: 删除打卡记录（软删除）

**请求头**: `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "message": "删除成功"
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200/0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 无权访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer {token}`
2. Token有效期30天，过期后需要重新登录
3. 打卡记录的图片URL需要先通过上传接口获取
4. 用户只能操作自己的打卡记录
5. 绑定关系是双向的，绑定后双方都可以看到对方的打卡记录（如果需要的话）
