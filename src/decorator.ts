import {Session, Element, h} from "koishi";
import {ForwardNode} from "./config";
import {logger} from "./logger";

import * as decorator from "./decorators";

function defaultDecorator({head, content}) {
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
	return {head: head, content: session.elements};
}

const localDecorators = [at2Name];

export function MsgDecorator(session: Session, node: ForwardNode) {
	let elems;
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

	if (_platform_out && typeof _platform_out.Decorator === "function") {
		return _platform_out.Decorator(elems);
	} else {
		return defaultDecorator(elems);
	}
}

function at2Name({head, content}) {
	for (const key in content) {
		const element = content[key];
		if (element.type === "at") {
			// Note: onebot-qq at 无昵称
			content[key] = h("span", `@${element.attrs.name || element.attrs.id}`);
		}
	}
	return {head: head, content: content};
}
