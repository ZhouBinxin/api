export async function sendMessage (data, env) {
  if (data.action === 'qywx') {
    return await qywx(data, env);
  } else if (data.action === 'email') {
    return await email(data, env);
  } else {
    return { status: 405, message: `不支持的消息类型 ${data.action}` };
  }
}

// 发送邮件（基于轻兔推送）
export async function email (data, env) {
  const url = 'https://notice.lighttools.net/send';

  let apikey = data.webhook;

  if (apikey || apikey.length < 32) {
    apikey = env.LN_APIKEY;
  }

  const payload = {
    apikey: apikey,
    channel: 'email',
    title: data.message.slice(0, 10),
    content: data.message,
  };

  try {
    const request = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (request.ok) {
      const responseData = await request.json();
      const { data, message } = responseData;
      return { status: request.status, message_id: data.message_id, result: data.result, message }
    } else {
      console.error('Message sending failed:', response.statusText);
      return { error: 'Message sending failed', status: response.status };
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    return { error: 'Failed to send message', details: error.message, status: 500 };
  }
}

// 发送企业微信消息
async function qywx (data, env) {
  let webhook = data.webhook;
  if (!isValidURL(webhook)) {
    webhook = env["QYWX" + webhook];
  }

  let requestData = {
    msgtype: data.msg_type
  };

  if (data.msg_type === 'text') {
    requestData.text = {
      content: data.message,
    };
  } else if (data.msg_type === 'image') {
    // const img_msg= JSON.parse(message);
    requestData.image = data.message;
  } else if (data.msg_type === 'markdown') {
    requestData.markdown = {
      content: data.message,
    };
  }

  // 发送消息
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const responseData = await response.json();
      const { errcode, errmsg } = responseData;
      return { status: response.status, errcode, errmsg };
    } else {
      console.error('Message sending failed:', response.statusText);
      return { error: 'Message sending failed', status: response.status };
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    return { error: 'Failed to send message', details: error.message, status: 500 };
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
