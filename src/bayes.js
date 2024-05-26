import { readData } from "./cf_kv"
// 分类垃圾短信
export async function classifySMS (requestData, env) {
  const messages = requestData.messages;
  const userMsg = messages[messages.length - 1]
  const content = userMsg.content;

  // 进行分类
  // const result = await classifyNB(content, env);
  const result = "垃圾短信";

  return await buildStreamData(result);
}

async function classifyNB (content, env) {
  // 读取训练好的模型
  let model = readData("bayes_en", env)

  if (!model) {
    return "模型加载失败";
  } else {
    model = JSON.parse(model);
  }

  const p0v = model.p0v;
  const p1v = model.p1v;
  const pAv = model.pAv;

  return "垃圾短信";
}

// 构建流式返回数据
async function buildStreamData (data) {
  const model = "bayes";
  const id = "chatcmpl-msg_ZlwSvFqpkf3WU11duaoC8ISTh";

  // 准备数据
  const messages = [];

  // 初始消息
  messages.push({
    id: id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [{
      index: 0,
      delta: { role: "assistant", content: "" }
    }]
  });

  // 每个字符单独返回
  messages.push({
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{
      index: 0,
      delta: { content: data }
    }]
  });

  // 结束消息
  messages.push({
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{
      index: 0,
      delta: {},
      finish_reason: "stop"
    }],
  });

  // 结束指示符
  messages.push("[DONE]");

  // 创建一个新的 ReadableStream
  const stream = new ReadableStream({
    async start (controller) {
      const encoder = new TextEncoder();
      for (const message of messages) {
        if (message === "[DONE]") {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        } else {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
      }
      controller.close();
    },
    cancel (reason) {
      console.log('Stream canceled', reason);
    }
  });

  return stream;
}
