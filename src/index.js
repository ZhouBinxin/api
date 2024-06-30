import { bing } from "./bing"
import { sendMessage } from "./msg"
import { oai } from "./oai"
import { cf_kv } from "./cf_kv"
import { translate } from "./translate"

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
				const res = {
					status: 200,
					'bing-img': '/bing?action=img',
					'oai-free':'/oai?action=auto'
				}
				return res;
			},
			"/favicon.ico": () => {
				return handleFavicon();
			},
			"/bing": async () => {
				return await bing(requestData, env);
			},
			"/msg": async () => {
				return await sendMessage(requestData, env);
			},
			"/oai": async () => {
				return await oai(requestData, env);
			},
			"/kv": async () => {
				return await cf_kv(requestData, env);
			},
			"/translate": async () => {
				return await translate(requestData, env);
			},
		};

		const handler = routeHandlers[path];
		if (handler) {
			const res = await handler();
			data.data = res;
			if (res.status === 302) {
				response = Response.redirect(res.url, 302);
			} else {
				response = new Response(JSON.stringify(data), { status: res.status, headers });
			}
		} else {
			response = new Response("Not Found", { status: 404 });
		}
	} catch (err) {
		console.error("Error handling request:", err);
		response = new Response("Internal Server Error", { status: 500 });
	}

	return response;
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
