import { bingImg } from "./bing"
import { sendMessage, qywx } from "./msg"
import { ctyun } from "./ecloud"
import { js_bus } from "./bus"
import { classifySMS } from "./bayes"

async function handleRequest (request, env) {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;

	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "*",
		"Access-Control-Allow-Headers": "*",
		"Content-Type": "application/json",
	};

	if (method === "OPTIONS") {
		return new Response(null, { headers });
	}

	const date = new Date();
	const formatter = new Intl.DateTimeFormat('zh-CN', {
		timeZone: 'Asia/Shanghai',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
	const timestamp = formatter.format(date);

	let data = {
		timestamp: timestamp,
	};

	let status = 200;

	if (path === "/") {
		return new Response(JSON.stringify(data), { status, headers });
	} else if (path === "/favicon.ico") {
		return handleFavicon();
	} else if (path.startsWith("/bing")) {
		const msg = await handleBing(request, env);
		data.msg = msg;
		return new Response(JSON.stringify(data), { status, headers });
	} else if (path.startsWith("/msg")) {
		const msg = await handleMsg(request, env);
		data.msg = msg;
		return new Response(JSON.stringify(data), { status, headers });
	} else if (path.startsWith("/ecloud")) {
		const msg = await handleEcloud(request, env);
		data.msg = msg;
		return new Response(JSON.stringify(data), { status, headers });
	} else if (path.startsWith("/bus")) {
		const msg = await handleBus(request, env);
		data.msg = msg;
		return new Response(JSON.stringify(data), { status, headers });
	} else if (path.startsWith("/v1/chat")) {
		const msg = await handleBayes(request, env);
		headers["Content-Type"] = "text/event-stream; charset=utf-8";
		return new Response(msg, { status, headers });
	}
}

async function handleBayes (request, env) {
	if (request.method === "POST") {
		const requestData = await request.json();

		const data = await classifySMS(requestData, env);

		return data;
	}
}

async function handleBus (request, env) {
	if (request.method === "POST") {
		const requestData = await request.json();
		const { content, id } = requestData;

		const data = await js_bus(content, id, env);

		return data;
	}
}

async function handleEcloud (request, env) {
	if (request.method === "POST") {
		if (new URL(request.url).pathname.startsWith('/ecloud/ctyun/keepalive')) {
			const { msg, userid } = await ctyun(request, env);
			if (msg === 'success') {
				await sendMsg(userid + 'ctyun keepalive success', env);
			}
			return msg;
		}
	}
}

async function handleMsg (request, env) {
	if (request.method === "POST") {
		const msg = await sendMessage(request, env);
		return msg;
	}
}

async function handleBing (request, env) {
	if (request.method === "GET") {
		if (new URL(request.url).pathname.startsWith('/bing/img')) {
			const imageUrl = await bingImg();
			return imageUrl;
		}
	}
}

async function handleFavicon () {
	const faviconUrl = 'https://blog.bxin.top/img/favicon.ico';
	return fetch(faviconUrl);
}

async function sendMsg (message, env) {
	const content = {
		"webhook": "H",
		"type": "text",
		"message": message
	};

	await qywx(content, env);
}

export default {
	async fetch (request, env) {
		return handleRequest(request, env);
	},
};
