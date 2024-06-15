import {Context} from "koishi";
import {} from "@koishijs/plugin-adapter-kook";
// import {} from "@koishijs/cache";

import {createConfig, ConfigSet} from "./config";
import {logger} from "./logger";
import {MessageForward} from "./message";

export const reusable = true;

// export const inject = {
// 	optional: ["cache"],
// };

export const usage = `Test usage`;
export const Config = createConfig();

// declare module "@koishijs/cache" {
// 	interface Tables {
// 		mpmf_message: string;
// 		mpmf_unity: string[];
// 	}
// }

export function apply(ctx: Context, cfg: ConfigSet) {
	ctx.on("message-created", async (session) => {
		const hitGroup = [];
		for (const g in cfg.Forward_Groups) {
			const group = cfg.Forward_Groups[g];
			for (const k in group.Forward_Node) {
				if (
					group.Forward_Node[k].Guild === session.channelId &&
					group.Forward_Node[k].Platform === session.platform &&
					group.Forward_Node[k].BotID !== session.userId
				) {
					logger.info("[message-created]", session.messageId, session.elements);
					hitGroup.push(g);
					break;
				}
			}
		}
		for (const g in hitGroup) {
			const group = cfg.Forward_Groups[hitGroup[g]];
			for (const k in group.Forward_Node) {
				if (group.Forward_Node[k].Guild !== session.channelId) {
					MessageForward(ctx, group.Forward_Node[k], session);
				}
			}
		}
	});
	ctx.on("message-deleted", async (session) => {
		logger.info("[message-deleted]", session.messageId);
	});
	// Note: KOOK消息编辑会改变消息ID
	ctx.on("message-updated", async (session) => {
		logger.info("[message-updated]", session.messageId, session);
	});
}
