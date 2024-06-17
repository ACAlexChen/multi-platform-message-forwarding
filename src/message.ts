import {Context, Session} from "koishi";
import {logger} from "./logger";
import {ForwardNode} from "./config";
import {MsgDecorator} from "./decorator";
import {MsgCache, msgCache} from "./cache";

export async function MessageForward(ctx: Context, node: ForwardNode, session: Session) {
	try {
		botExistsCheck(ctx, node);
		const uuid = session.channelId + ":" + session.messageId;
		await ctx.bots[`${node.Platform}:${node.BotID}`]
			.sendMessage(node.Guild, MsgDecorator(session, node))
			.then((res) => {
				let mc = {
					platform: node.Platform,
					bot: node.BotID,
					guild: node.Guild,
					msgid: res[0],
					uuid,
				};
				msgCache(mc);
				logger.debug("Forward", mc);
			});
	} catch (error) {
		logger.error(`ERROR:<MessageSend> ${error}`);
	}
}

export async function MessageDelete(ctx: Context, msg: MsgCache) {
	try {
		botExistsCheck(ctx, {Platform: msg.platform, BotID: msg.bot, Guild: msg.guild});
		await ctx.bots[`${msg.platform}:${msg.bot}`].deleteMessage(msg.guild, msg.msgid);
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
