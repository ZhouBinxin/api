export async function sendMessage (request, env) {
  const { method, content } = await request.json();

  if (method === 'qywx') {
    return await qywx(content, env);
  } else if (method === 'email') {
    return await email(content, env);
  } else {
    return 'Unsupported method:' + method;
  }
}

// 发送邮件（基于轻兔推送）
export async function email (content, env) {
  const { webhook, message } = content;
  const url = 'https://notice.lighttools.net/send';

  const payload = {
    apikey: webhook | env.LN_APIKEY,
    channel: 'email',
    title: message.title,
    content: message.content,
  };

  const request = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (request.ok) {
    return message.content.slice(0, 10);
  } else {
    return request.statusText;
  }
}

// 发送企业微信消息
export async function qywx (content, env) {
  let webhook = content.webhook;
  const { type, message } = content;

  if (!isValidURL(webhook)) {
    webhook = env["QYWX" + webhook];
  }

  let requestData = {
    msgtype: type
  };
  if (type === 'text') {
    requestData.text = {
      content: message,
    };
  } else if (type === 'image') {
    // const img_msg= JSON.parse(message);
    requestData.image = message;
  } else if (type === 'markdown') {
    requestData.markdown = {
      content: message,
    };
  }
  // 发送POST请求到指定的webhook地址
  const response = await fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  // 返回消息发送结果
  if (response.ok) {
    return message.slice(0, 10);
  } else {
    return response.statusText;
  }
}

// 判断是否为合法的URL
function isValidURL (str) {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // 协议
    '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // 域名
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // IP 地址
    '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // 端口和路径
    '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // 查询字符串
    '(\\#[-a-zA-Z\\d_]*)?$', 'i'); // 片段标识符
  return pattern.test(str);
}
