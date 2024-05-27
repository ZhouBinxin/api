import { readData } from "./cf_kv"
// 分类垃圾短信
export async function classifySMS (requestData, env) {
  const messages = requestData.messages;
  const userMsg = messages[messages.length - 1]
  const content = userMsg.content;

  // 进行分类
  const result = await nativeBayes(content, env);

  return await buildStreamData(result);
}

async function nativeBayes (content, env) {
  // 读取训练好的模型
  let model = await readData("bayes_en", env)
  
  if (!model) {
    return "模型加载失败";
  } else {
    model = JSON.parse(model);
  }

  const vocabList = model.vocabList;
  const p0v = model.p0V;
  const p1v = model.p1V;
  const pAb = model.pAb;

  // 将句子分词并转为小写
  const words = content.match(/[a-zA-Z]+/g);
  const lowerCaseWords = words.map(word => word.toLowerCase());

  const thisDoc = await setOfWords2Vec(vocabList, lowerCaseWords);

  const result = await classifyNB(thisDoc, p0v, p1v, pAb);

  if (result == 1) {
    return "垃圾短信";
  } else {
    return "正常短信";
  }
}

async function classifyNB (vec2Classify, p0Vec, p1Vec, pClass1) {
  // 元素相乘
  let p1 = vec2Classify.map((value, index) => value * p1Vec[index]).reduce((a, b) => a + b, 0) + Math.log(pClass1);
  let p0 = vec2Classify.map((value, index) => value * p0Vec[index]).reduce((a, b) => a + b, 0) + Math.log(1.0 - pClass1);
  console.log(`p1: ${p1}, p0: ${p0}`);
  if (p1 > p0) {
    return 1; // 垃圾短信
  } else {
    return 0; // 正常短信
  }
}


async function setOfWords2Vec (vocabList, inputSet) {
  // 创建一个长度与词表相同且所有元素都为0的数组
  let returnVec = new Array(vocabList.length).fill(0);

  // 遍历输入文档中的所有单词
  for (let word of inputSet) {
    if (vocabList.includes(word)) {
      // 如果词表中的单词在输入文档中出现，则将 returnVec 中对应位置的值设为1
      returnVec[vocabList.indexOf(word)] = 1;
    } else {
      console.log(`the word: ${word} is not in my Vocabulary!`);
    }
  }
  return returnVec;
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
