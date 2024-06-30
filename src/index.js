import { bing } from "./bing"
import { sendMessage } from "./msg"
import { ctyun } from "./ecloud"
import { js_bus } from "./bus"
import { check_url } from "./qywx"
import { oaifree } from "./oaifree"
import { ths } from "./ths"
import { cf_kv } from "./cf_kv"

async function handleRequest (request, env) {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;

	const requestData = await parseRequestData(request);

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

	let response;

	try {
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

		const routeHandlers = {
			"/": async () => {
				return new Response(JSON.stringify(data), { status: 200, headers });
			},
			"/favicon.ico": () => {
				return handleFavicon();
			},
			"/bing": async () => {
				const res = await bing(requestData, env);
				data.data = res;
				return new Response(JSON.stringify(data), { status: res.status, headers });
			},
			"/msg": async () => {
				const res = await sendMessage(requestData, env);
				data.data = res;
				return new Response(JSON.stringify(data), { status: res.status, headers });
			},
			"/ecloud": async () => {
				data.msg = await handleEcloud(request, env);
				return new Response(JSON.stringify(data), { status, headers });
			},
			"/bus": async () => {
				data.msg = await handleBus(request, env);
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
				data.msg = await handlerTHS(request, env);
				return new Response(JSON.stringify(data), { status, headers });
			},
			"/kv": async () => {
				const res = await cf_kv(requestData, env);
				data.data = res;
				return new Response(JSON.stringify(data), { status: res.status, headers });
			},
		};

		const handler = routeHandlers[path];
		if (handler) {
			response = await handler();
		} else {
			response = new Response("Not Found", { status: 404 });
		}
	} catch (err) {
		console.error("Error handling request:", err);
		response = new Response("Internal Server Error", { status: 500 });
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

async function parseRequestData (request) {
	const method = request.method.toUpperCase();
	let data = {};

	if (method === "GET") {
		// Parse URL search params for GET request
		const url = new URL(request.url);
		const params = new URLSearchParams(url.search);
		params.forEach((value, key) => {
			data[key] = value;
		});
	} else if (method === "POST") {
		// Parse body for POST request
		const contentType = request.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			// JSON body
			data = await request.json();
		} else if (contentType.includes("application/x-www-form-urlencoded")) {
			// Form URL-encoded body
			const formData = await request.formData();
			formData.forEach((value, key) => {
				data[key] = value;
			});
		} else {
			// Other types of body (text, etc.)
			const text = await request.text();
			try {
				data = JSON.parse(text);
			} catch (error) {
				// Handle parsing error
				console.error("Error parsing request body:", error);
				data = {};
			}
		}

		// Merge URL search params with data object
		const url = new URL(request.url);
		const params = new URLSearchParams(url.search);
		params.forEach((value, key) => {
			if (!(key in data)) {
				data[key] = value;
			}
		});
	}

	return data;
}


async function handleFavicon () {
	const faviconUrl = 'https://blog.xbxin.com/img/favicon.ico';
	return fetch(faviconUrl);
}

export default {
	async fetch (request, env) {
		return handleRequest(request, env);
	},
};
