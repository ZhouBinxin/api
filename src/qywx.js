export async function qywx (request, env) {

}

export async function check_url (request, env) {
  const encodingAESKey = env.WX_BOT_EncodingAESKey;
  const token = env.WX_BOT_TOKEN;

  // 获取请求参数
  const url = new URL(request.url);
  const msg_signature = url.searchParams.get('msg_signature');
  const timestamp = url.searchParams.get('timestamp');
  const nonce = url.searchParams.get('nonce');
  const echostr = url.searchParams.get('echostr');

  // 获取消息体签名校验结果
  const check_result = await check_msg_signature(msg_signature, token, timestamp, nonce, echostr);

  if (check_result) {
    const decrypt_result = await msg_base64_decrypt(echostr, encodingAESKey);
    return decrypt_result;
  }
}

async function msg_base64_decrypt (ciphertext_base64, key_base64) {
  // 处理密文、密钥和iv
  const ciphertext_bytes = Uint8Array.from(atob(ciphertext_base64), c => c.charCodeAt(0))
  const key_bytes = Uint8Array.from(atob(key_base64), c => c.charCodeAt(0))
  const iv_bytes = key_bytes.slice(0, 16)

  // 导入密钥
  const key = await crypto.subtle.importKey(
    'raw',
    key_bytes,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  )

  // 解密
  const plaintext_bytes = new Uint8Array(await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv_bytes },
    key,
    ciphertext_bytes
  ))

  // 截取数据，判断消息正文字节数
  const msg_len_bytes = plaintext_bytes.slice(16, 20)
  const msg_len = new DataView(msg_len_bytes.buffer).getUint32(0, false)

  // 根据消息正文字节数截取消息正文，并转为字符串格式
  const msg_bytes = plaintext_bytes.slice(20, 20 + msg_len)
  const msg = new TextDecoder().decode(msg_bytes)

  return msg
}

async function check_msg_signature (msg_signature, token, timestamp, nonce, echostr) {
  let li = [token, timestamp, nonce, echostr];
  li.sort();

  const li_str = li[0] + li[1] + li[2] + li[3];

  // 计算SHA-1值
  const encoder = new TextEncoder()
  const data = encoder.encode(li_str)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // 比较SHA-1值
  if (hashHex === msg_signature) {
    return true;
  } else {
    return false;
  }
}