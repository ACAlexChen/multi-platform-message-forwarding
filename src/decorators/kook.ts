import {Session, h} from "koishi";

export function kook(session: Session) {
	session.elements.unshift(
		h("b", `${session.author.name}`),
		h("span", " 转发自 "),
		h("i", `${session.platform}`),
		h("span", `：`),
		h("br"),
	);
	return session.content;
}

// import {logger} from "../logger";
// interface KField {
// 	Type: string;
// 	Content: string;
// 	Src: string;
// }
// interface KModule {
// 	Type: string;
// 	Text: KField;
// 	Elements: KField[];

// 	// for file
// 	Title: string;
// 	Src: string;
// 	Size: number;
// }
// interface KCard {
// 	Type: string;
// 	Theme: string;
// 	Size: string;
// 	Modules: KModule[];
// }
// function kcardBuild(Session: Session) {
// 	for (let element of Session.elements as any) {
// 		logger.info(element);
// 	}
// }
