## 基于 Cloudflare Workers 的接口

### 获取bing每日壁纸
- 请求方式：GET
- 请求地址：https://api.bxin.workers.dev/bing/img
- 返回数据：
```json
{
  "timestamp": "2024/05/19 15:37:00",
  "msg": "https://global.bing.com/th?id=OHR.VernazzaItaly_ZH-CN6245826569_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"
}
```

### 天翼云

#### 云电脑保活
- 请求方式：POST
- 请求地址：https://api.bxin.workers.dev/ecloud/ctyun/keepalive
- 请求参数：
```json
{
  "objId": "xxx",
  "deviceCode": "xxx",
  "userid": "xxx",
  "secret_key": "xxx"
}
```
- 返回数据：
```json
{
  "code": 200,
  "msg": "success"
}
```