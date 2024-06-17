import {Context} from "koishi";
import {logger} from "./logger";

export interface MsgCache {
	platform: string;
	bot: string;

	guild: string;
	msgid: string;

	uuid: string;
}

import {} from "@koishijs/cache";
declare module "@koishijs/cache" {
	interface Tables {
		msgCache: MsgCache;
	}
}
let ctx;
function cacheNotEnabled() {
	if (!ctx.cache) {
		return true;
	}
	return false;
}
export function msgCacheInit(context: Context) {
	ctx = context;
}
export async function msgCache(mc: MsgCache) {
	if (cacheNotEnabled()) {
		return;
	}
	const key = mc.guild + ":" + mc.msgid;
	logger.debug("[message-cache]", key, mc);
	await ctx.cache.set("msgCache", key, mc, 7200 * 1000);
}

export async function msgCacheDelete(key: string) {
	if (cacheNotEnabled()) {
		return;
	}
	await ctx.cache.delete("msgCache", key);
}

export async function msgCacheFindByKey(key: string) {
	if (cacheNotEnabled()) {
		return;
	}
	return await ctx.cache.get("msgCache", key);
}

export async function msgCacheFindByUUID(uuid: string) {
	if (cacheNotEnabled()) {
		return;
	}
	let caches = await ctx.cache.entries("msgCache");
	let result = [];
	for await (const item of caches) {
		if (item[1].uuid === uuid) {
			result.push(item);
		}
	}
	return result;
}
