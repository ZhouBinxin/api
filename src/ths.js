import { readData, writeData } from "./cf_kv"
export async function ths (request, env) {
  const { method, content } = await request.json();

  if (method === "update") {
    await updateSecret(content, env);
    const msg = await star(env);
    return msg;
  } else if (method === "read") {
    return await readSecret(content, env);
  }
}

// 更新机密值
async function updateSecret (content, env) {
  const key = "ths_token"
  writeData(key, content.secret, env);
}

async function readSecret (content, env) {
  const token = env.BX_TOKEN
  if (content.token != token) {
    return false;
  }

  const key = "ths_token"
  return readData(key, env)
}

// 点赞和取消点赞
async function star (env) {
  const repo_owner = 'ZhouBinxin';
  const repo_name = 'Convertible_bonds';
  const access_token = env.ACCESS_TOKEN;

  const url = `https://api.github.com/user/starred/${repo_owner}/${repo_name}`;

  const headers = {
    'Authorization': `token ${access_token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  };

  try {
    // 取消点赞
    const unstar_response = await fetch(url, {
      method: 'DELETE',
      headers: headers
    });

    if (unstar_response.status === 204) {
      console.log(`Unstarred ${repo_owner}/${repo_name} successfully.`);

      // 点赞仓库
      const star_response = await fetch(url, {
        method: 'PUT',
        headers: headers
      });

      if (star_response.status === 204) {
        return `Starred ${repo_owner}/${repo_name} successfully.`;
      } else {
        return `Failed to star ${repo_owner}/${repo_name}. Status code: ${star_response.status}`;
      }
    } else {
      return `Failed to unstar ${repo_owner}/${repo_name}. Status code: ${unstar_response.status}`;
    }
  } catch (error) {
    return `Error starring/unstarring ${repo_owner}/${repo_name}: ${error.message}`;
  }
}
