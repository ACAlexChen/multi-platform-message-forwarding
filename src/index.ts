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
	// if (ctx.cache) {
	// 	var cachechannel: string[] = [];
	// 	cfg.Forward_Groups.forEach((channels) => {
	// 		channels.Forward_Node.forEach((channel) => {
	// 			cachechannel.push(channel.Guild);
	// 		});
	// 	});
	// }

	// let pass = [];

	// ctx.command("TemporaryExclusion <time>", "临时排除转发功能（time单位：毫秒）", {
	// 	authority: 3,
	// }).action(({session}, time) => {
	// 	pass.push(session.channelId);
	// 	let time_num = parseInt(time);
	// 	ctx.setTimeout(() => {
	// 		pass.splice(pass.indexOf(session.channelId), 1);
	// 		session.send(`已恢复转发功能`);
	// 	}, time_num);
	// 	session.send(`已临时排除此频道转发功能${time_num}毫秒`);
	// });

	// ctx.command("CancelTE", "取消临时排除转发功能", {authority: 3}).action(
	// 	({session}) => {
	// 		if (pass.includes(session.channelId)) {
	// 			pass.splice(pass.indexOf(session.channelId), 1);
	// 			session.send("已恢复转发功能");
	// 		} else if (!pass.includes(session.channelId)) {
	// 			session.send("此频道未排除转发");
	// 		}
	// 	},
	// );

	ctx.on("message", async (session) => {
		let hitGroup = [];
		for (const g in cfg.Forward_Groups) {
			let group = cfg.Forward_Groups[g];
			for (const k in group.Forward_Node) {
				if (
					group.Forward_Node[k].Guild === session.channelId &&
					group.Forward_Node[k].Platform === session.platform &&
					group.Forward_Node[k].BotID !== session.userId
				) {
					hitGroup.push(g);
					break;
				}
			}
		}
		for (const g in hitGroup) {
			let group = cfg.Forward_Groups[hitGroup[g]];
			for (const k in group.Forward_Node) {
				if (group.Forward_Node[k].Guild !== session.channelId) {
					MessageForward(ctx, group.Forward_Node[k], session);
				}
			}
		}
	});
}
