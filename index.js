const { get } = require("https");
const { Server } = require("http");
const server = Server();
const cache = new Map();

function update () {
	return new Promise((res, rej) => {
		get({
			hostname: "yonle.github.io",
			path: "/discorduser-globalban/list"
		}, stream => {
			let ArrayBuffer = [];
			stream.on('error', async () => res(await update()));
			stream.on('data', data => {
				ArrayBuffer.push(data);
			});
			
			stream.on('end', () => {
				let result = Buffer.concat(ArrayBuffer).toString("utf-8");
				delete ArrayBuffer;
				cache.clear();

				result.split("\n").forEach(data => {
					if (!data || !data.length) {
						delete data;
						return;
					}
					let splitted = data.split(" ");
					let id = splitted.shift();
					if (isNaN(Number(id))) {
						delete splitted;
						delete id;
						delete data;
						return false;
					}
					let reason = splitted.join(" ");
					if (!cache.has(id)) cache.set(id, []);
					cache.get(id).push(reason);
					delete reason;
					delete splitted;
					delete id;
					delete data;
				});

				res(cache);
				delete result;
			});
		}).on('error', async () => res(await update()));
	});
}

server.on('request', (req, res) => {
	if (req.url.startsWith("/check/")) {
		let id = req.url.slice("/check/".length);
		console.log(id)
		if (!id.length || isNaN(id)) {
			res.status = 400;
			return res.end(JSON.stringify({ message: "Invalid ID", code: "INV_ID" }));
		} else if (!cache.has(id)) {
			res.status = 400;
			return res.end(JSON.stringify({ message: "Not available", code: "NOT_AVAILABLE" }));
		} else {
			return res.end(JSON.stringify(cache.get(id)));
		}
	} else {
		res.end("Endpoint: /check/[UserID]");
	}
});

const listener = server.listen(process.env.PORT || 8080, async () => {
	console.log(`Listening on port`, listener.address().port);
	setInterval(update, 1000 * 60);
	update();
});
