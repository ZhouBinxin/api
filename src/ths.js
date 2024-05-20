import { addJSON, selectData } from "./worker_kv"

export async function bond_ths (request, env) {
  // 获取请求的 URL
  const url = new URL(request.url)

  // 获取请求参数
  const params = url.searchParams

  // 获取名为 "key" 的请求参数
  const key = params.get('key')


  const { username, password } = JSON.parse(await selectData(env, key))

  return await get_cookie(username, password)
}

async function get_cookie (username, password) {
  // 对用户名和密码进行编码和加密
  const encodedUsername = await encode(username);
  const hashedPassword = await encode(await hex_md5(password));

  const url = "http://ft.10jqka.com.cn/thsft/jgbservice";

  const params = {
    reqtype: "verify",
    account: encodedUsername,
    passwd: hashedPassword,
    qsid: "800",
    securities: "同花顺iFinD",
    jgbversion: "1.10.12.405",
    Encrypt: "1"
  };

  // console.log(params)

  // // 构造查询字符串
  // const queryString = new URLSearchParams(params).toString();

  // // 发送 HTTP 请求
  // const response = await fetch(`${url}?${queryString}`);
  // console.log(response.headers)
  // if (!response.ok) {
  //   throw new Error(`HTTP error! Status: ${response.status}`);
  // }

  // // 解析响应中的 Set-Cookie 头部信息
  // const setCookie = response.headers.get('Set-Cookie');
  // const cookies = parseCookies(setCookie);

  // return cookies;
}

// 辅助函数：解析 Set-Cookie 头部信息
function parseCookies (setCookieHeader) {
  if (!setCookieHeader) return {};

  const cookies = {};
  const cookieList = setCookieHeader.split(';');

  for (const cookie of cookieList) {
    const [key, value] = cookie.split('=');
    cookies[key.trim()] = value.trim();
  }

  return cookies;
}


async function hex_md5 (c) {
  // 将输入字符串编码为 UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(c);

  // 使用 Web Crypto API 的 SubtleCrypto 接口计算 MD5 哈希值
  const hashBuffer = await crypto.subtle.digest('MD5', data);

  // 将计算得到的哈希值转换为十六进制表示
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

async function encode (b) {
  const modulus = 'CB99A3A4891FFECEDD94F455C5C486B936D0A37247D750D299D66A711F5F7C1EF8C17EAFD2E1552081DFFD1F78966593D81A499B802B18B0D76EF1D74F217E3FD98E8E05A906245BEDD810557DFB8F653118E59293A08C1E51DDCFA2CC13251A5BE301B080A0C93A587CB71BAED18AEF9F1E27DA6877AFED6BC5649DB12DD021'
  const publicExponent = '10001'
  return encrypt_encode(b)
}

function encrypt_encode (b) {
  const rsa_key_str = `-----BEGIN PUBLIC KEY-----
  MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLmaOkiR/+zt2U9FXFxIa5NtCj
  ckfXUNKZ1mpxH198HvjBfq/S4VUggd/9H3iWZZPYGkmbgCsYsNdu8ddPIX4/2Y6O
  BakGJFvt2BBVffuPZTEY5ZKToIweUd3PoswTJRpb4wGwgKDJOlh8txuu0Yrvnx4n
  2mh3r+1rxWSdsS3QIQIDAQAB
  -----END PUBLIC KEY-----`;
}