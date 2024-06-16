import {Context, Session} from "koishi";
import {logger} from "./logger";
import {ForwardNode} from "./config";
import {MsgDecorator} from "./decorator";

export async function MessageForward(ctx: Context, node: ForwardNode, session: Session) {
	try {
		botExistsCheck(ctx, node);
		logger.debug(
			await ctx.bots[`${node.Platform}:${node.BotID}`].sendMessage(
				node.Guild,
				MsgDecorator(session, node),
			),
		);
	} catch (error) {
		logger.error(`ERROR:<MessageSend> ${error}`);
	}
}

export async function MessageDelete(ctx: Context, node: ForwardNode, session: Session) {
	try {
		botExistsCheck(ctx, node);
		await ctx.bots[`${node.Platform}:${node.BotID}`].deleteMessage(
			node.Guild,
			"msgID",
		);
	} catch (error) {
		logger.error(`ERROR:<MessageDelete> ${error}`);
	}
}

export async function MessageEdit(ctx: Context, node: ForwardNode, session: Session) {
	try {
		botExistsCheck(ctx, node);
		await ctx.bots[`${node.Platform}:${node.BotID}`].editMessage(
			node.Guild,
			"msgID",
			"new msgContent",
		);
	} catch (error) {
		logger.error(`ERROR:<MessageEdit> ${error}`);
	}
}

function botExistsCheck(ctx: Context, node: ForwardNode) {
	if (ctx.bots[`${node.Platform}:${node.BotID}`] == undefined) {
		throw new Error("Bot Not Found");
	}
}
