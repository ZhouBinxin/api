import { Environment } from "vitest";

async function handleRequest (request: Request, env: Environment) {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;

	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "*",
		"Access-Control-Allow-Headers": "*",
		"Content-Type": "application/json",
	}

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
	}

	let status = 200;

	if (path === "/") {
		return new Response(JSON.stringify(data), { status, headers });
	} else if (path === "/favicon.ico") {
		return handleFavicon();
	}
}

async function handleFavicon () {
	const faviconUrl = 'https://blog.bxin.top/img/favicon.ico';
	return fetch(faviconUrl);
}

export default {
	async fetch (request: Request, env: Environment) {
		return handleRequest(request, env);
	},
};
