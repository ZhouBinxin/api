import * as crypto from 'node:crypto';

// 天翼云
export async function ecloud (request, env) {

}

export async function ctyun (request, env) {
  const { objId, deviceCode, userid, secret_key } = await request.json();
  const url = "https://desk.ctyun.cn:8810/api/";
  const computer_connect = "desktop/client/connect";

  //  设置连接云电脑时需要的设备信息
  const device_info = {
    "objId": objId,
    "objType": 0,
    "osType": 15,
    "deviceId": 60,
    "deviceCode": deviceCode,
    "deviceName": "Edge浏览器",
    "sysVersion": "Windows NT 10.0; Win64; x64",
    "appVersion": "1.36.1",
    "hostName": "Edge浏览器",
    "vdCommand": "",
    "ipAddress": "",
    "macAddress": "",
    "hardwareFeatureCode": deviceCode
  };

  //  配置请求头中需要的一些参数
  const app_model_value = "2";
  const device_code_value = deviceCode;
  const device_type_value = "60";
  const request_id_value = "1704522993726";
  const tenant_id_value = "15";
  const timestamp_value = Date.now().toString();
  const userid_value = userid;
  const version_value = "201360101";
  const secret_key_value = secret_key;

  //  创建签名字符串
  const signature_str = device_type_value + request_id_value + tenant_id_value + timestamp_value + userid_value + version_value + secret_key_value;

  //  使用MD5算法创建签名
  let hash = crypto.createHash('md5');
  hash.update(signature_str);
  const digest_hex = hash.digest('hex').toUpperCase();

  // 发送POST请求
  const response = await fetch(url + computer_connect, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'ctg-appmodel': app_model_value,
      'ctg-devicecode': device_code_value,
      'ctg-devicetype': device_type_value,
      'ctg-requestid': request_id_value,
      'ctg-signaturestr': digest_hex,
      'ctg-tenantid': tenant_id_value,
      'ctg-timestamp': timestamp_value,
      'ctg-userid': userid_value,
      'ctg-version': version_value
    },
    body: new URLSearchParams(device_info)
  });

  const data = await response.json();
  const code = data["code"];

  let msg = "error";
  if (code === 0) {
    msg = "success";
  }
  return { msg: msg, userid: userid };
}