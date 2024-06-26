import { bingImg } from "./bing"
import { sendMessage, qywx } from "./msg"
import { ctyun } from "./ecloud"
import { js_bus } from "./bus"
import { classifySMS } from "./bayes"
import { check_url } from "./qywx"
import { oaifree } from "./oaifree"
import { ths } from "./ths"

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

	// Handle CORS preflight request
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
	let response;

	// Route handlers mapped to paths
	const routeHandlers = {
		"/": async () => {
			return new Response(JSON.stringify(data), { status, headers });
		},
		"/favicon.ico": () => {
			return handleFavicon();
		},
		"/bing": async () => {
			data.data = await handleBing(request, env);
			return new Response(JSON.stringify(data), { status, headers });
		},
		"/msg": async () => {
			const msg = await handleMsg(request, env);
			data.msg = msg;
			return new Response(JSON.stringify(data), { status, headers });
		},
		"/ecloud": async () => {
			const msg = await handleEcloud(request, env);
			data.msg = msg;
			return new Response(JSON.stringify(data), { status, headers });
		},
		"/bus": async () => {
			const msg = await handleBus(request, env);
			data.msg = msg;
			return new Response(JSON.stringify(data), { status, headers });
		},
		"/v1/chat": async () => {
			const msg = await handleBayes(request, env);
			if (msg instanceof ReadableStream) {
				headers["Content-Type"] = "text/event-stream; charset=utf-8";
			}
			return new Response(msg, { status, headers });
		},
		"/qywx": async () => {
			return new Response(await handlerQYWX(request, env), { status, headers });
		},
		"/oai": async () => {
			return Response.redirect(await handlerOAI(request, env), 302);
		},
		"/ths": async () => {
			const msg = await handlerTHS(request, env);
			data.msg = msg;
			return new Response(JSON.stringify(data), { status, headers });
		},
	};

	// Find handler for the current path
	const handler = routeHandlers[path];
	if (handler) {
		response = await handler();
	} else {
		response = new Response("Not Found", { status: 404 });
	}

	return response;
}


async function handlerTHS (request, env) {
	const msg = await ths(request, env);
	return msg;
}

async function handlerOAI (request, env) {
	return oaifree(request, env);
}

async function handlerQYWX (request, env) {
	const msg = await check_url(request, env);
	// await qywx(request, env);

	return msg;
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
			return await bingImg();
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
