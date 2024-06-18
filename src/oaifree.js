export async function oaifree (request, env) {
  const refreshTokenList = env.rt;

  // 随机选择一个refreshToken
  const randomIndex = Math.floor(Math.random() * refreshTokenList.length);
  const refreshToken = refreshTokenList[randomIndex];

  const accessToken = await getAccessToken(refreshToken);
  const shareToken = await getShareToken(accessToken);

  return autoLogin(shareToken);
}

// 获取当前时间戳
function getCurrentTimestamp () {
  return Math.floor(Date.now() / 1000);
}

// 使用 rt 换取 at
async function getAccessToken (refreshToken) {
  const url = 'https://token.oaifree.com/api/auth/refresh';
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const data = `refresh_token=${refreshToken}`;

  const response = await fetch(url, { method: 'POST', headers, body: data });
  if (response.ok) {
    const json = await response.json();
    if (json.access_token) {
      return json.access_token;
    } else {
      throw new Error('Failed to generate access token, response: ' + JSON.stringify(json));
    }
  } else {
    throw new Error('Failed to refresh access token');
  }
}

// 使用 at 生成 st
async function getShareToken (accessToken) {
  const url = 'https://chat.oaifree.com/token/register';
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
  const data = `unique_name=${generateRandomHex(8)}&access_token=${accessToken}&expires_in=0&site_limit=&gpt35_limit=-1&gpt4_limit=-1&show_conversations=false`;

  const response = await fetch(url, { method: 'POST', headers, body: data });
  if (response.ok) {
    const json = await response.json();
    if (json.token_key) {
      return json.token_key;
    } else {
      throw new Error('Failed to generate share token, response: ' + JSON.stringify(json));
    }
  } else {
    throw new Error('Failed to generate share token');
  }
}

// 生成随机字符串
function generateRandomHex (length) {
  let result = '';
  const characters = '0123456789abcdef';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// 自动登录
function autoLogin (shareToken) {
  const loginUrl = `https://chat.xbxin.com/auth/login_share?token=${shareToken}`;
  console.log('Logging in with URL: ' + loginUrl);
  return loginUrl;
}
