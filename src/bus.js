import { readData, writeData } from "./cf_kv"

export async function js_bus (content, id, env) {
  let params = {};
  if (content === "lines") {
    await getLines(env);
    const data = await readData('lines', env);
    return data;
  } else if (content === "line") {
    params = {
      'Action': 'GetXianLuZhanDian',
      'XianLu': id,
    };
  } else if (content === "bus") {
    params = {
      'Action': 'GetXianLuCheKuang',
      'XianLu': '101',
    };
  }
  return await handleRequest(params);
}

// 获取所有线路
async function getLines (env) {
  const params = {
    'Action': 'GetAllRunningXianLu'
  };

  const data = await handleRequest(params);
  if (!data) {
    return false;
  }

  const XianLuList = data.RetData.XianLuList;

  await writeData('lines', JSON.stringify(XianLuList), env)
}

async function handleRequest (params) {
  const url = 'http://qzjs.shishigj.com/WeixinMP/WMPWebService/GJ.ShiShiGJ/HandlerX.ashx';
  const queryParams = new URLSearchParams(params);
  const apiUrl = `${url}?${queryParams.toString()}`;

  const response = await fetch(apiUrl);
  // console.log(response.text)
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return false;
  }
}