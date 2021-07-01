const { get } = require("https");
const { Server } = require("http");
const server = Server();

function ban () {
	return new Promise((res, rej) => {
		get({
			hostname: "yonle.github.io",
			path: "/discorduser-globalban/list"
		}, stream => {
			let ArrayBuffer = [];
			stream.on('error', async () => res(await ban()));
			stream.on('data', data => {
				ArrayBuffer.push(data);
			});
			
			stream.on('end', () => {
				let result = Buffer.concat(ArrayBuffer).toString("utf-8");
				delete ArrayBuffer;
				ban.cache.clear();

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
					if (!ban.cache.has(id)) ban.cache.set(id, []);
					ban.cache.get(id).push(reason);
					delete reason;
					delete splitted;
					delete id;
					delete data;
				});

				res(ban.cache);
				delete result;
			});
		}).on('error', async () => res(await ban()));
	});
}

ban.cache = new Map();

module.exports = ban;
