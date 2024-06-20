export async function ths (request, env) {
  const content = await request.json();
  let msg = await updateSecret(content, env);
  msg = msg + '\n' + await star(env);
  return msg
}

// 更新机密值
async function updateSecret (content, env) {
  const repo_owner = 'ZhouBinxin';
  const repo_name = 'Convertible_bonds';
  const access_token = env.ACCESS_TOKEN;

  const secret_name = 'REFRESHTOKEN';

  const url = `https://api.github.com/repos/${repo_owner}/${repo_name}/actions/secrets/${secret_name}`;

  const headers = {
    'Authorization': `token ${access_token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json', // 添加 Content-Type
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  };

  const data = JSON.stringify({ // 将数据转换为字符串
    'encrypted_value': content.secret,
    'key_id': env.BOND_KET_ID
  });

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: data
    });

    if (response.status === 204) {
      return `Secret ${secret_name} updated successfully.`;
    } else {
      return `Failed to update secret ${secret_name}. Status code: ${response.status} \n ${await response.text()}`;
    }
  } catch (error) {
    return `Error updating secret ${secret_name}: ${error.message}`;
  }
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
