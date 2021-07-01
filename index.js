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

module.exports = {
	update, cache
}
