import {Schema} from "koishi";

export interface ForwardNode {
	Platform: string;
	Guild: string;
	BotID: string;
	note?: string;
}

export interface ConfigSet {
	ChannelName_Setting: boolean;
	Forward_Groups: {
		Forward_Node: ForwardNode[];
	}[];
}

export const createConfig = () =>
	Schema.intersect([
		Schema.object({
			ChannelName_Setting: Schema.boolean()
				.description("是否包含频道名称")
				.default(false),
		}).description("转发格式"),
		Schema.object({
			Forward_Groups: Schema.array(
				Schema.object({
					Forward_Node: Schema.array(
						Schema.object({
							Platform: Schema.union([
								"telegram",
								"discord",
								"onebot",
								"kook",
								"slack",
								"qq",
							])
								.role("select")
								.required()
								.description("平台"),
							Guild: Schema.string().required().description("频道ID"),
							BotID: Schema.string().required().description("机器人ID"),
							note: Schema.string().description("备注"),
						}),
					)
						.role("table")
						.description("配置转发节点"),
				}),
			).description("互通转发组"),
		}),
	]) as Schema<ConfigSet>;
