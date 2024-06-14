import {Element, h} from "koishi";

import {Buffer} from "buffer";
const transparentPixel = Buffer.from(
	"R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
	"base64",
);

export function kook({head, content}) {
	let msg: Element[] = [];
	msg = msg.concat(head, h("br"), content, h.image(transparentPixel, "image/gif"));
	return msg;
}

// TODO: add custom kcard builder
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
