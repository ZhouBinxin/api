export async function translate (data, env) {
  if (data.action === 'baidu') {
    return await baidu(data, env);
  } else if (data.action === 'deeplx') {
    return await deeplx_self(data, env);
  } else {
    return { status: 405, error: `不支持的类型 ${data.action}` }
  }
}

async function baidu (data, env) {
  const appid = env.BAIDU_APP_ID;
  const appkey = env.BAIDU_APP_SECRET;

  const url = "http://api.fanyi.baidu.com/api/trans/vip/translate";

  // 随机生成 salt
  const salt = Math.floor(Math.random() * (65536 - 32768 + 1)) + 32768;

  // 计算 md5
  const sign = await makeMd5(`${appid}${data.text}${salt}${appkey}`);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const payload = {
    "appid": appid,
    "q": data.text,
    "from": data.from || 'auto',
    "to": data.to || 'zh',
    "salt": salt,
    "sign": sign
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: new URLSearchParams(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return { status: 200, data }
    } else {
      return { status: response.status, message: response.statusText }
    }
  } catch (err) {
    return { status: 500, message: err.message }
  }
}

async function makeMd5 (str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}


async function deeplx_self (data, env) {
  const url = 'https://deeplx.xbxin.com/translate';

  const payload = {
    "text": data.text,
    "source_lang": data.from || 'auto',
    "target_lang": data.to || 'zh'
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data)
      const res = {
        status: 200,
        from: data.from || 'auto',
        to: data.to || 'zh',
        trans_result: {
          src: data.text,
          dst: data.data,
          alternatives: data.alternatives
        }
      }
      return res;
    } else {
      console.log(response)
      return deeplx(data, env);
    }
  } catch (err) {
    console.log(err)
    return deeplx(data, env);
  }
}


async function deeplx (data, env) {
  const token = env.LINUX_TOKEN;
  const url = `https://api.deeplx.org/${token}/translate`;

  const payload = {
    "text": data.text,
    "source_lang": data.from || 'auto',
    "target_lang": data.to || 'zh'
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      const res = {
        status: 200,
        from: data.from || 'auto',
        to: data.to || 'zh',
        trans_result: {
          src: data.text,
          dst: data.data,
          alternatives: data.alternatives
        }
      }
      return res;
    } else {
      return { status: response.status, error: response.statusText }
    }
  } catch (err) {
    return { status: 500, error: err.message }
  }
}