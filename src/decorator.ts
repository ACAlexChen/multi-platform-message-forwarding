import {Session, h} from "koishi";
import {ForwardNode} from "./config";
import {logger} from "./logger";

import {kook} from "./decorators/kook";

const decorators = {
	kook,
};

function defaultDeco(session: Session) {
	for (const key in session.elements) {
		const element = session.elements[key];
		if (element.type === "at") {
			logger.info(element);
			session.elements[key] = h("span", `@${element.attrs.name}`);
		}
	}
	session.elements.unshift(
		h("b", `${session.author.name}`),
		h("span", " 转发自 "),
		h("i", `${session.platform}`),
		h("span", `：`),
		h("br"),
	);
	return session.content;
}

export function MsgDecorator(session: Session, node: ForwardNode) {
	if (typeof decorators[node.Platform] === "function") {
		return decorators[node.Platform](session);
	} else {
		return defaultDeco(session);
	}
}
