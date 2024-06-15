import {Session, Element, h} from "koishi";
import {ForwardNode} from "./config";
import {logger} from "./logger";

import {kook} from "./decorators/kook";

const decorators = {
	kook,
};

function defaultDeco({head, content}) {
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
	for (const key in session.elements) {
		const element = session.elements[key];
		if (element.type === "at") {
			logger.info(element);
			session.elements[key] = h("span", `@${element.attrs.name}`);
		}
	}
	return {head: head, content: session.elements};
}

export function MsgDecorator(session: Session, node: ForwardNode) {
	const fw = defaultMiddleware(session);
	if (typeof decorators[node.Platform] === "function") {
		return decorators[node.Platform](fw);
	} else {
		return defaultDeco(fw);
	}
}
