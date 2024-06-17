import {Session, Element, h} from "koishi";
import {ForwardNode} from "./config";

import * as decorator from "./decorators";

interface ForwardMsg {
	head: Element[];
	content: Element[];
}

function defaultDecorator({head, content}: ForwardMsg) {
	let msg: Element[] = [];
	msg = msg.concat(head, h("br"), content);
	return msg;
}

function defaultMiddleware(session: Session) {
	let head: Element[] = [
		h("b", `${session.username}`),
		h("span", " 转发自 "),
		h("i", `${session.platform}`),
		h("span", `：`),
	];
	return {head: head, content: session.elements} as ForwardMsg;
}

const localDecorators = [at2Name];

export async function MsgDecorator(session: Session, node: ForwardNode) {
	let elems: ForwardMsg;
	let _platform_in = decorator[session.platform];
	let _platform_out = decorator[node.Platform];
	if (_platform_in && typeof _platform_in.Middleware === "function") {
		elems = _platform_in.Middleware(session);
	} else {
		elems = defaultMiddleware(session);
	}

	localDecorators.forEach((fn) => {
		elems = fn(elems);
	});
	if (session.quote && session.quote.id) {
		elems = await quoteTranslator(session, node, elems);
	}

	if (_platform_out && typeof _platform_out.Decorator === "function") {
		return _platform_out.Decorator(elems);
	} else {
		return defaultDecorator(elems);
	}
}

function at2Name({head, content}: ForwardMsg) {
	for (const key in content) {
		const element = content[key];
		if (element.type === "at") {
			// Note: onebot-qq at 无昵称
			content[key] = h("span", `@${element.attrs.name || element.attrs.id}`);
		}
	}
	return {head: head, content: content} as ForwardMsg;
}

import {logger} from "./logger";
import {msgCacheFindByKey, msgCacheGetLocalIDByUUID} from "./cache";
async function quoteTranslator(
	session: Session,
	node: ForwardNode,
	{head, content}: ForwardMsg,
) {
	const key = session.channelId + ":" + session.quote.id;
	const cache = await msgCacheFindByKey(key);
	if (cache) {
		let msgid = await msgCacheGetLocalIDByUUID(node, cache.uuid);
		if (msgid) {
			head.unshift(h("quote", {id: msgid}));
		} else {
			logger.error(`[msgCacheGetLocalIDByUUID] ${cache.uuid} not found`);
		}
	}
	return {head: head, content: content} as ForwardMsg;
}
