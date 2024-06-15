import {Element, Session, h} from "koishi";

function Middleware(session: Session) {
	const platform = guessPlatform(session);

	let head: Element[] = [
		h("b", `${session.username}`),
		h("span", " 转发自 "),
		h("i", `${platform}`),
		h("span", `：`),
	];
	return {head: head, content: session.elements};
}

function guessPlatform(session: Session) {
	if (session.event.user && session.event.user.avatar) {
		if (session.event.user.avatar.includes("q.qlogo.cn")) {
			return "QQ";
		}
	}
	return session.platform;
}

export default {
	Middleware,
};
