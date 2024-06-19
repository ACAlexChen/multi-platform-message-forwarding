import {Context, Session} from "koishi";
import {logger} from "./logger";
import {ForwardNode} from "./config";
import {MsgDecorator, MsgDecoratorFallback} from "./decorator";
import {MsgCache, msgCache} from "./cache";

async function MessageSendWithDecorator(
	ctx: Context,
	node: ForwardNode,
	session: Session,
	Deco: Function,
) {
	const uuid = session.channelId + ":" + session.messageId;
	const content = await Deco(session, node);
	await ctx.bots[`${node.Platform}:${node.BotID}`]
		.sendMessage(node.Guild, content)
		.then((res) => {
			let mc = {
				platform: node.Platform,
				bot: node.BotID,
				guild: node.Guild,
				msgid: res[0],
				uuid,
			};
			msgCache(mc);
			logger.debug(`[MessageForward] to ${mc.platform} ${mc.uuid}`);
		})
		.catch((error) => {
			throw error;
		});
}
export async function MessageForward(ctx: Context, node: ForwardNode, session: Session) {
	if (!botExistsCheck(ctx, node)) {
		return;
	}
	MessageSendWithDecorator(ctx, node, session, MsgDecorator).catch((error) => {
		logger.error(`ERROR:<MessageSend ${node.Platform}> ${error}`);
		MessageSendWithDecorator(ctx, node, session, MsgDecoratorFallback).catch(
			(error) => {
				logger.error(`ERROR:<MessageSendFallback ${node.Platform}> ${error}`);
			},
		);
	});
}

export async function MessageDelete(ctx: Context, msg: MsgCache) {
	if (
		!botExistsCheck(ctx, {Platform: msg.platform, BotID: msg.bot, Guild: msg.guild})
	) {
		return;
	}
	await ctx.bots[`${msg.platform}:${msg.bot}`]
		.deleteMessage(msg.guild, msg.msgid)
		.catch((error) => {
			logger.error(`ERROR:<MessageDelete> ${error}`);
		});
}

export async function MessageEdit(ctx: Context, node: ForwardNode, session: Session) {
	if (!botExistsCheck(ctx, node)) {
		return;
	}
	try {
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
		logger.error(`ERROR:<BOT not Exist> ${node.Platform}:${node.BotID}`);
		return false;
	}
	return true;
}
