import {Context, Session} from "koishi";
import {logger} from "./logger";
import {ForwardNode} from "./config";
import {MsgDecorator} from "./decorator";

export async function MessageForward(ctx: Context, node: ForwardNode, session: Session) {
	try {
		if (ctx.bots[`${node.Platform}:${node.BotID}`] == undefined) {
			throw new Error("Bot Not Found");
		}
		await ctx.bots[`${node.Platform}:${node.BotID}`].sendMessage(
			node.Guild,
			MsgDecorator(session, node),
		);
	} catch (error) {
		logger.error(`ERROR:<MessageSend> ${error}`);
	}
}
