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
function cacheNotEnabled(ctx: Context) {
	if (!ctx.cache) {
		return true;
	}
	return false;
}
export async function msgCache(ctx: Context, mc: MsgCache) {
	if (cacheNotEnabled(ctx)) {
		return;
	}
	const key = mc.guild + ":" + mc.msgid;
	logger.debug("[message-cache]", key, mc);
	await ctx.cache.set("msgCache", key, mc, 7200 * 1000);
}

export async function msgCacheDelete(ctx: Context, key: string) {
	if (cacheNotEnabled(ctx)) {
		return;
	}
	await ctx.cache.delete("msgCache", key);
}

export async function msgCacheFindByKey(ctx: Context, key: string) {
	if (cacheNotEnabled(ctx)) {
		return;
	}
	return await ctx.cache.get("msgCache", key);
}

export async function msgCacheFindByUUID(ctx: Context, uuid: string) {
	if (cacheNotEnabled(ctx)) {
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
