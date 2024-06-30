// 读取数据
export async function cf_kv (data, env) {
  const token = env.BX_TOKEN;
  if (data.token != token) {
    return { status: 403, body: "token error" }
  }
  if (data.action == "read") {
    return await readData(data.key, env);
  } else if (data.action == "write") {
    return await writeData(data.key, data.value, env);
  } else {
    return { status: 405, message: `不支持的类型 ${data.action}` }
  }
}

export async function readData (key, env) {
  const store = env.api;
  try {
    const data = await store.get(key);
    return { status: 200, value: data };
  } catch (err) {
    console.log("KV read error:" + err);
    return { status: 500, error: err };
  }
}

// 写入数据
export async function writeData (key, value, env) {
  const store = env.api;
  try {
    await store.put(key, value);
    return { status: 200, message: "success" };
  } catch (err) {
    console.log("KV write error:" + err);
    return { status: 500, error: err };
  }
}