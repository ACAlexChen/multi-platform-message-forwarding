import {Schema} from "koishi";

export interface ForwardNode {
	Platform: string;
	Guild: string;
	BotID: string;
	note?: string;
}

export interface ConfigSet {
	WithChannelName: boolean;
	WithPlatformName: boolean;
	CacheTimeout: number;
	ForwardGroups: {
		Nodes: ForwardNode[];
	}[];
}

export const createConfig = () =>
	Schema.intersect([
		Schema.object({
			WithChannelName: Schema.boolean()
				.description("是否包含频道名称")
				.default(false),
			WithPlatformName: Schema.boolean()
				.description("是否包含平台名称")
				.default(true),
		})
			.description("转发格式")
			.hidden(),
		Schema.object({
			CacheTimeout: Schema.number()
				.description("消息缓存时间（分钟）- 影响跨平台删除与回复等功能")
				.default(120)
				.min(120)
				.max(1440 * 7),
		}).description("消息缓存"),

		Schema.object({
			ForwardGroups: Schema.array(
				Schema.object({
					Note: Schema.string().description("互通组备注"),
					Nodes: Schema.array(
						Schema.object({
							Platform: Schema.string()
								.role("")
								.required()
								.description("平台"),
							Guild: Schema.string().required().description("频道ID"),
							BotID: Schema.string().required().description("机器人ID"),
						}),
					)
						.role("table")
						.description("转发节点"),
				}),
			).description("互通转发组"),
		}).description("互通组"),
	]) as Schema<ConfigSet>;
