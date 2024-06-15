import {Element, h} from "koishi";
import {Buffer} from "buffer";
const transparentPixel = Buffer.from(
	"R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
	"base64",
);

function Decorator({head, content}) {
	let msg: Element[] = [];
	msg = msg.concat(head, h("br"), content, h.image(transparentPixel, "image/gif"));
	return msg;
}

export default {
	Decorator,
};
