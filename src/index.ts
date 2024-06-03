import { Context, Schema } from 'koishi'
import {} from '@koishijs/plugin-adapter-kook'

export const name = 'multi-platform-message-forwarding'

export const reusable = true


export interface Config {
  UserName_Package_Format?: string
  ChannelName_Package_Format?: string

  UserName_Setting: boolean
  ChannelName_Setting: boolean
  Nickname_Setting: boolean
  Message_Wrapping_Setting: boolean

  Forward_Mode: string
  Original_Target: {
    Original_Guild: string
    Original_Platform: string
    Original_BotID: string
    Target_Guild: string
    Target_Platform: string
    Target_BotID: string
    note?:string
  }[]

  Which_Platform_Use_getChannel: {}[]
}





export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    ChannelName_Setting: Schema.boolean().description('是否在转发消息前加上群聊/频道的名称').default(false),
  }).description('基础设置'),
  Schema.union([
    Schema.object({
      ChannelName_Setting: Schema.const(true),
      ChannelName_Package_Format: Schema.tuple([String, String]).description('请输入名称左右两旁的封装符号'),
    }),
    Schema.object({}),
  ]),

  Schema.object({
    UserName_Setting: Schema.boolean().description('是否在转发消息前加上用户的名称').default(true),
  }),
  Schema.union([
    Schema.object({
      UserName_Setting: Schema.const(true),
      UserName_Package_Format: Schema.tuple([String, String]).description('请输入名称左右两旁的封装符号').default(['[',']']),
      Nickname_Setting: Schema.boolean().description('是否使用群昵称作为消息开头（如果存在时）').default(true),
    }),
    Schema.object({}),
  ]),

  Schema.object({
    Message_Wrapping_Setting: Schema.boolean().description('是否自动换行消息原文与消息开头').default(false)
  }),

  Schema.object({
    Forward_Mode: Schema.union(['单向转发','双向转发','群聊互联！']).required().description('转发模式').role('radio'),
  }).description('转发设置'),

  Schema.union([
    Schema.object({
      Forward_Mode: Schema.const('单向转发').required(),
      Original_Target: Schema.array(Schema.object({
        Original_Guild: Schema.string().required().description('消息源群聊/频道ID'),
        Original_Platform: Schema.string().required().description('消息源平台'),
        Original_BotID: Schema.string().required().description('消息源机器人ID'),
        Target_Guild: Schema.string().required().description('转发目标群聊/频道ID'),
        Target_Platform: Schema.string().required().description('转发目标平台'),
        Target_BotID: Schema.string().required().description('转发目标机器人ID'),
        note: Schema.string().description('备注')
      })).role('table').description('消息源与转发目标（单向转发）')
    }),

    Schema.object({
      Forward_Mode: Schema.const('双向转发').required(),
      Original_Target: Schema.array(Schema.object({
        Original_Guild: Schema.string().required().description('群聊/频道ID（1）'),
        Original_Platform: Schema.string().required().description('平台（1）'),
        Original_BotID: Schema.string().required().description('机器人ID（1）'),
        Target_Guild: Schema.string().required().description('群聊/频道ID（2）'),
        Target_Platform: Schema.string().required().description('平台（2）'),
        Target_BotID: Schema.string().required().description('机器人ID（2）'),
        note: Schema.string().description('备注')
      })).role('table').description('消息源与转发目标（双向转发）')
    }),

    Schema.object({
      Forward_Mode: Schema.const('群聊互联！').required(),
      Original_Target: Schema.array(Schema.object({
        Original_Guild: Schema.string().required().description('群聊/频道ID'),
        Original_Platform: Schema.string().required().description('平台'),
        Original_BotID: Schema.string().required().description('机器人ID'),
        Target_Guild: Schema.string().hidden().default('nothing'),
        Target_Platform: Schema.string().hidden().default('nothing'),
        Target_BotID: Schema.string().hidden().default('nothing'),
        note: Schema.string().description('备注')
      })).role('table').description('消息源与转发目标（群聊互联！）')
    })
  ]),

  Schema.object({
    Which_Platform_Use_getChannel: Schema.array(String).role('table').description('哪些平台使用getChannel获取频道名称（无法正常获取频道名称时可尝试添加）').default(['discord'])
  }).description('高级设置')
]) as Schema<Config>



export function apply(ctx: Context,cfg:Config) {
  async function Message_Forwarding(Original_Guild : string, Original_Platform : string, Original_BotID: string, Target_Guild : string, Target_Platform : string, Target_BotID: string) {
    ctx.on('message',async (session) => {
      try {
        if (session.channelId === Original_Guild && session.platform === Original_Platform && session.userId !== Original_BotID && session.userId !== Target_BotID){
          if (cfg.UserName_Setting === true){
            if (cfg.Nickname_Setting === false){
              let userInfo = await session.bot.getGuildMember(session.guildId,session.userId)
              var userName = userInfo.user.name
            } else if (cfg.Nickname_Setting === true){
              var userName = session.username
            }
          }
          if (cfg.ChannelName_Setting === true){
            if (cfg.Which_Platform_Use_getChannel.includes(session.platform)){
              var ChannelName = (await session.bot.getChannel(session.channelId)).name
            } else {
              var ChannelName = session.event.channel.name
            }
          }
          let messageInfo = []
          if (ChannelName) {
            messageInfo.push(`${cfg.ChannelName_Package_Format[0]}${ChannelName}${cfg.ChannelName_Package_Format[1]}`)
          }
          if (userName) {
            messageInfo.push(`${cfg.UserName_Package_Format[0]}${userName}${cfg.UserName_Package_Format[1]}`)
          }
  
          if (cfg.UserName_Setting === false && cfg.ChannelName_Setting === false){
            messageInfo.push(`${session.content}`)
          } else if (cfg.Message_Wrapping_Setting === false){
            messageInfo.push(`: ${session.content}`)
          } else if (cfg.Message_Wrapping_Setting === true){
            messageInfo.push(`: &#10;${session.content}`)
          }
          let message = messageInfo.join(' ')
          ctx.bots[`${Target_Platform}:${Target_BotID}`].sendMessage(Target_Guild,message)
        }
      } catch (error) {
        ctx.logger.error(`消息转发函数错误：${error}`)
      }
    })
  }


  ctx.logger.info(cfg.Which_Platform_Use_getChannel)


  if (cfg.Forward_Mode === '单向转发'){
    try {
      for (let i = 0; i < cfg.Original_Target.length; i++){
        let item = cfg.Original_Target[i]
        Message_Forwarding(
          item.Original_Guild,
          item.Original_Platform,
          item.Original_BotID,
          item.Target_Guild, 
          item.Target_Platform,
          item.Target_BotID
        )
      }
    } catch (error) {
      ctx.logger.error(`单向转发模式错误：${error}`)
    }
  } else if (cfg.Forward_Mode === '双向转发'){
    try {
      for (let i = 0; i < cfg.Original_Target.length; i++){
        let item = cfg.Original_Target[i]
        Message_Forwarding(
          item.Original_Guild,
          item.Original_Platform,
          item.Original_BotID,
          item.Target_Guild,
          item.Target_Platform,
          item.Target_BotID
        )
        Message_Forwarding(
          item.Target_Guild,
          item.Target_Platform,
          item.Target_BotID,
          item.Original_Guild,
          item.Original_Platform,
          item.Original_BotID
        )
      }
    } catch (error) {
      ctx.logger.error(`双向转发模式错误：${error}`)
    }
  } else if (cfg.Forward_Mode === '群聊互联！'){
    try {
      let existingItems = []
      function itemExists(item, array) {
        return array.some(
          existingItem =>
            JSON.stringify(existingItem) === JSON.stringify(item)
        )
      }
      for (let i = 0; i < cfg.Original_Target.length; i++) {
        for (let o = i + 1; o < cfg.Original_Target.length; o++) {
          let item_i = cfg.Original_Target[i]
          let item_o = cfg.Original_Target[o]
          let item_array = {
            Original_Guild: item_i.Original_Guild,
            Original_Platform: item_i.Original_Platform,
            Original_BotID: item_i.Original_BotID,
            Target_Guild: item_o.Original_Guild,
            Target_Platform: item_o.Original_Platform,
            Target_BotID: item_o.Original_BotID
          }
          let reverse_item_array = {
            Original_Guild: item_o.Original_Guild,
            Original_Platform: item_o.Original_Platform,
            Original_BotID: item_o.Original_BotID,
            Target_Guild: item_i.Original_Guild,
            Target_Platform: item_i.Original_Platform,
            Target_BotID: item_i.Original_BotID
          }
          if (!itemExists(item_array, existingItems)) {
            existingItems.push(item_array)
            Message_Forwarding(
              item_i.Original_Guild,
              item_i.Original_Platform,
              item_i.Original_BotID,
              item_o.Original_Guild,
              item_o.Original_Platform,
              item_o.Original_BotID
            )
          }
          if (!itemExists(reverse_item_array, existingItems)) {
            existingItems.push(reverse_item_array)
            Message_Forwarding(
              item_o.Original_Guild,
              item_o.Original_Platform,
              item_o.Original_BotID,
              item_i.Original_Guild,
              item_i.Original_Platform,
              item_i.Original_BotID
            )
          }
        }
      }
    } catch (error) {
      ctx.logger.error(`群聊互联模式错误：${error}`)
    }
  }
}

