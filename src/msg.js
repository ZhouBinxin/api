import { Environment } from "vitest";

export async function sendMessage (request, env) {
  const { method, content } = request;

  if (method === 'qywx') {
    return await qywx(content, env);
  } else if (method === 'email') {
    console.log(content)
    return await sendEmail(content, env);
  } else if (method === 'cfemail') {
    return await sendCFEmail(content, env);
  }
  else {
    return 'Unsupported method';
  }
}

async function sendEmail (content, env) {
  const { subject, body, to_email } = content;
  const requestData = { "subject": subject, "body": body, "to_email": to_email }
  const neoapi = 'https://neoapi.bxin.top/msg'
  const response = await fetch(neoapi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  // 返回消息发送结果
  if (response.ok) {
    return { Msg: subject, count: count };
  } else {
    return { errorMsg: response.statusText };
  }
}

export async function sendCFEmail (content, type = "text/plain; charset=utf-8") {
  const { subject, body, to_email, from_email } = content;
  const email_url = "https://email.bxin.workers.dev/"
  const data = {
    "from": "sender@bxin.top",
    "fromn": "Sender Name",
    "to": "receiver@bxin.top",
    "ton": "Receiver Name",
    "rep": "",
    "repn": "",
    "dkim": "",
    "dkims": "",
    "dkimpk": "",
    "type": "text/plain; charset=utf-8",
    "sbj": "Email Subject",
    "body": "Email Body"
  }
  const response = await fetch(email_url, {
    method: 'POST',
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'cache-control': 'max-age=0',
      'origin': 'https://email.bxin.workers.dev',
      'priority': 'u=0, i',
      'referer': 'https://email.bxin.workers.dev/submit',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    },
    body: new URLSearchParams({
      'from': 'sender@bxin.top',
      'fromn': '',
      'to': 'receiver@bxin.top',
      'ton': '',
      'rep': '',
      'repn': '',
      'dkim': '',
      'dkims': '',
      'dkimpk': '',
      'type': 'text/plain; charset=utf-8',
      'sbj': 'test',
      'body': 'test'
    })
  });
  if (response.ok) {
    return { Msg: subject };
  } else {
    return { errorMsg: response.statusText };
  }
}

async function qywx (content, env) {
  const { type, msgtype, message, webhook, img_md5 } = content;

  // 根据type类型选择不同的webhook地址
  let webhookUrl;
  if (type === 'default') {
    webhookUrl = env.WEBHOOK_URL;
  } else if (type === 'course') {
    webhookUrl = env.COURSE;
  } else if (type === "custom") {
    webhookUrl = webhook;
  }
  else {
    return { errorMsg: 'Invalid type' };
  }

  let requestData = {};
  if (msgtype === 'text') {
    requestData = {
      msgtype: msgtype,
      text: {
        content: message,
      },
    }
  } else if (msgtype === 'image') {
    requestData = {
      msgtype: msgtype,
      image: {
        base64: message,
        md5: img_md5,
      },
    }
  }
  // 发送POST请求到指定的webhook地址
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  // 返回消息发送结果
  if (response.ok) {
    let count = await updateCount(env)
    return { Msg: message, count: count };
  } else {
    return { errorMsg: response.statusText };
  }
}


