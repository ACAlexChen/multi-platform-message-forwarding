import {Context, Session} from "koishi";
import {logger} from "./logger";
import {ForwardNode} from "./config";

function getUserName(Session: Session) {
	return Session.author.name;
}

function getPlatform(Session: Session) {
	return Session.platform;
}

// TODO: 临时装饰器
function msgDecorator(Session: Session) {
	const msg = `<b>${getUserName(Session)}</b> 转发自 <i>${getPlatform(Session)}</i>：<br/>${Session.content}`;
	return msg;
}

export async function MessageForward(ctx: Context, Node: ForwardNode, Session: Session) {
	try {
		// TODO: 增加统一装饰器于平台装饰器
		await ctx.bots[`${Node.Platform}:${Node.BotID}`].sendMessage(
			Node.Guild,
			msgDecorator(Session),
		);
	} catch (error) {
		logger.error(`ERROR:<MessageSend> ${error}`);
	}
}
