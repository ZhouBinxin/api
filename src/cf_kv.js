// 读取数据
export async function readData (key, env) {
  const store = env.api;
  try {
    const data = await store.get(key);
    return data;
  } catch (err) {
    console.log("KV read error:" + err);
    return false;
  }
}

// 写入数据
export async function writeData (key, value, env) {
  const store = env.api;
  try {
    await store.put(key, value);
    return true;
  } catch (err) {
    console.log("KV write error:" + err);
    return false;
  }
}