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

## 消息发送

- 请求方式：POST
- 请求地址：https://api.bxin.workers.dev/msg
### 企业微信
#### 文本/markdwon类型
- 请求参数：
```json
{
  "method": "qywx",
  "content": {
    "webhook":"H",
    "type": "text",
    "message": "hello world"
  }
}
```

| 参数名   | 参数类型 | 是否必填 | 参数说明|
| ---------- | ------------ | ------------ | ------------ |
| method      | string      | 是         | 消息类型,qywx|
| content     | object      | 是         | 消息内容 |
| webhook     | string      | 是         | 企业微信机器人webhook |
| type        | string      | 是         | 消息类型,text/markdown |
| message     | string      | 是         | 消息内容 |

#### 图片类型
- 请求参数：
```json
{
  "method": "qywx",
  "content": {
    "webhook":"H",
    "type": "image",
    "message": {
      "base64": "xxx",
      "md5": "xxx"
    }
  }
}
```
| 参数名   | 参数类型 | 是否必填 | 参数说明|
| ---------- | ------------ | ------------ | ------------ |
| method      | string      | 是         | 消息类型,qywx|
| content     | object      | 是         | 消息内容 |
| webhook     | string      | 是         | 企业微信机器人webhook |
| type        | string      | 是         | 消息类型,image |
| message     | object      | 是         | 消息内容 |
| base64     | string      | 是         | 图片base64编码 |
| md5     | string      | 是         | 图片md5值 |

#### 邮件（轻兔推送https://notice.lighttools.net/）

- 请求参数：
```json
{
  "method": "email",
  "content": {
    "webhook": "apikey",
    "message":{
      "title": "hello world",
      "content": "hello world"
    }
  }
}
```
| 参数名   | 参数类型 | 是否必填 | 参数说明|
| ---------- | ------------ | ------------ | ------------ |
| method      | string      | 是         | 消息类型,email|
| content     | object      | 是         | 消息内容 |
| webhook     | string      | 是         | 轻兔推送apikey |
| message     | object      | 是         | 消息内容 |
| title     | string      | 是         | 标题 |
| content     | string      | 是         | 内容 |

