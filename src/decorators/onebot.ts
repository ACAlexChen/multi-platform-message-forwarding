import {Element, Session, h} from "koishi";

function Middleware(session: Session) {
	let platform = session.platform;
	if (session.event.user && session.event.user.avatar) {
		if (session.event.user.avatar.includes("q.qlogo.cn")) {
			platform = "QQ";
		}
	}
	let head: Element[] = [
		h("b", `${session.username}`),
		h("span", " 转发自 "),
		h("i", `${platform}`),
		h("span", `：`),
	];
	return {head: head, content: session.elements};
}

export default {
	Middleware,
};
