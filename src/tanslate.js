export async function translate (request, env) {
  const { method, content } = request;
  const { text, source_lang, target_lang } = content;

  if (method == "deeplx") {
    return await deeplx(text, source_lang, target_lang);
  } else if (method == "baidu") {
    return await baidu(env, text, source_lang, target_lang);
  }
}

export async function baidu (env, text, source_lang = 'auto', target_lang = 'zh') {
  const appid = env.BAIDU_APP_ID;
  const appkey = env.BAIDU_APP_SECRET;

  const url = "http://api.fanyi.baidu.com/api/trans/vip/translate";

  // 随机生成 salt
  const salt = Math.floor(Math.random() * (65536 - 32768 + 1)) + 32768;

  // 计算 md5
  const sign = await makeMd5(`${appid}${text}${salt}${appkey}`);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const payload = {
    "appid": appid,
    "q": text,
    "from": source_lang,
    "to": target_lang,
    "salt": salt,
    "sign": sign
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: new URLSearchParams(payload)
  });

  const data = await response.json();

  return data.trans_result[0].dst;
}

async function makeMd5 (str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}


export async function deeplx (text, source_lang = 'en', target_lang = 'zh') {
  const url = "https://api.deeplx.org/translate";

  const data = {
    "text": text,
    "source_lang": source_lang,
    "target_lang": target_lang
  }

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.data);
    })
    .catch(error => {
      console.error("Error:", error);
    });
}