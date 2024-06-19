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

const localDecorators = [atTranslator, quoteTranslator];

export async function MsgDecorator(session: Session, node: ForwardNode) {
	let elems: ForwardMsg = {head: [], content: []};
	let _platform_in = decorator[session.platform];
	let _platform_out = decorator[node.Platform];
	if (_platform_in && typeof _platform_in.Middleware === "function") {
		elems = _platform_in.Middleware(session);
	} else {
		elems = defaultMiddleware(session);
	}

	for (const fn of localDecorators) {
		elems = (await fn(session, node, elems)) as ForwardMsg;
	}

	if (_platform_out && typeof _platform_out.Decorator === "function") {
		return _platform_out.Decorator(elems);
	} else {
		return defaultDecorator(elems);
	}
}

function defaultDecoratorFallback({head, content}: ForwardMsg) {
	let msg: Element[] = [];
	let newContent: Element[] = [];
	for (const key in content) {
		if (content[key].type in ["img", "audio", "video", "file"]) {
			newContent.push(h("span", ` [${content[key].type}] `));
		} else {
			newContent.push(content[key]);
		}
	}
	msg = msg.concat(head, h("br"), newContent);
	return msg;
}
export async function MsgDecoratorFallback(session: Session, node: ForwardNode) {
	let elems: ForwardMsg = {head: [], content: []};
	elems = defaultMiddleware(session);
	for (const fn of localDecorators) {
		elems = (await fn(session, node, elems)) as ForwardMsg;
	}
	return defaultDecoratorFallback(elems);
}

async function atTranslator(
	session: Session,
	node: ForwardNode,
	{head, content}: ForwardMsg,
) {
	const newMsg = await new Promise((resolve, reject) => {
		let newContent: Element[] = [];
		for (const key in content) {
			const element = content[key];
			if (element.type === "at") {
				if (element.attrs.id !== session.selfId) {
					// Note: onebot-qq at 无昵称
					newContent.push(
						h("span", `@${element.attrs.name || element.attrs.id}`),
					);
				}
			} else {
				newContent.push(element);
			}
		}
		resolve({head: head, content: newContent} as ForwardMsg);
	});
	return newMsg;
}

import {logger} from "./logger";
import {msgCacheFindByKey, msgCacheGetLocalIDByUUID} from "./cache";
async function quoteTranslator(
	session: Session,
	node: ForwardNode,
	{head, content}: ForwardMsg,
) {
	if (!session.quote || !session.quote.id) {
		return {head: head, content: content} as ForwardMsg;
	}
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
