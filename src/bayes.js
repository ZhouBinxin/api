// 分类垃圾短信
export async function classifySMS (requestData, env) {
  console.log(requestData);
  const messages = requestData.messages;
  console.log(messages);
  const userMsg = messages[messages.length - 1]
  const content = userMsg.content;

  // 时间戳
  const timestamp = new Date().getTime();

  const data = {
    "id": "chatcmpl-89DCbotAKoJjhtZZhBVCQ48O9lAYa",
    "object": "chat.completion",
    "created": timestamp,
    "model": "bayes",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "垃圾短信"
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": content.length,
      "completion_tokens": 4,
      "total_tokens": content.length + 4
    }
  }

  return JSON.stringify(data);
}