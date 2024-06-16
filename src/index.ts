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
export const name = `forward hime - 转发姬`;
const version = `<sub>v1.1.1</sub>`;
export const usage = `
# ${name} ${version}
## 配置说明
1. 添加 \`互通转发组\`
2. 为添加的 \`互通转发组\` 配置转发节点。每个转发节点对应某个平台的一个频道或群组
## 特性
- 可以配置多个 \`互通转发组\`，每个 \`互通转发组\` 之间相互独立
- 启用插件后，当一个 \`互通转发组\` 中的任意节点收到消息时，插件会自动将消息转发给**这个**\`互通转发组\`中的其他节点。
---`;

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
		for (const g in cfg.ForwardGroups) {
			const group = cfg.ForwardGroups[g];
			for (const k in group.Nodes) {
				if (
					group.Nodes[k].Guild === session.channelId &&
					group.Nodes[k].Platform === session.platform &&
					group.Nodes[k].BotID !== session.userId
				) {
					logger.info("[message-created]", session.messageId, session.elements);
					hitGroup.push(g);
					break;
				}
			}
		}
		for (const g in hitGroup) {
			const group = cfg.ForwardGroups[hitGroup[g]];
			for (const k in group.Nodes) {
				if (group.Nodes[k].Guild !== session.channelId) {
					MessageForward(ctx, group.Nodes[k], session);
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
