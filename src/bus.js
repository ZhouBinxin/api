export async function js_bus (content, id) {
  let params = {};
  if (content === "lines") {
    params = {
      'Action': 'GetAllRunningXianLu'
    };
  } else if (content === "line") {
    params = {
      'Action': 'GetXianLuZhanDian',
      'XianLu': id,
    }
  } else if (content === "bus") {
    params = {
      'Action': 'GetXianLuCheKuang',
      'XianLu': '101',
    }
  }
  return await handleRequest(params);
}

async function handleRequest (params) {
  const url = 'http://qzjs.shishigj.com/WeixinMP/WMPWebService/GJ.ShiShiGJ/HandlerX.ashx';
  const queryParams = new URLSearchParams(params);
  const apiUrl = `${url}?${queryParams.toString()}`;

  const response = await fetch(apiUrl);
  // console.log(response.text)
  if (response.ok) {
    const data = await response.json();
    return JSON.stringify(data)
  } else {
    return 'error'
  }
}