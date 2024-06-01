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
<font color=red>
该接口无法正常使用

WARNING: known issue with `fetch()` requests to custom HTTPS ports in published Workers:the custom port will be ignored when the Worker is published using the `wrangler deploy` command.
</font>

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

## 垃圾短信判断
> 接口和 OpenAI 一致
- 请求方式：POST
- 请求地址：https://api.bxin.workers.dev/v1/chat/completions
- 请求参数：
```json
{
  "model": "bayes",
  "messages": [
    {"role": "user", "content": "hello world"}
  ],
  "stream": true
}
```

| 参数名   | 参数类型 | 是否必填 | 参数说明|
| ---------- | ------------ | ------------ | ------------ |
| model      | string      | 是         | 模型名称,bayes |
| messages    | array       | 是         | 对话内容 |
| role        | string      | 是         | 角色名称,user |
| content     | string      | 是         | 对话内容 |
| stream      | boolean     | 是         | 是否流式返回 |

## 翻译

- 请求方式：POST
- 请求地址：
- 请求参数：
```json
{
  {
    "method": "baidu",
    "content": {
      "text": "hello world",
      "source_lang": "zh",
      "target_lang": "en"
    }
  }
}
```

| 参数名   | 参数类型 | 是否必填 | 参数说明|
| ---------- | ------------ | ------------ | ------------ |
| method      | string      | 是         | 翻译方法,baidu/deeplx（deeplx暂不可用） |
| content     | object      | 是         | 翻译内容 |
| text         | string      | 是         | 翻译内容 |
| source_lang  | string      | 否         | 源语言 |
| target_lang  | string      | 是         | 目标语言 |
