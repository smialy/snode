import {
    Controller,
    Get,
    Post,
    Delete,
    SocketController,
    OnInit,
    OnPublish,
    OnConnect,
    OnDisconnect,
    ISession,
    IWebContext,
    ISocketContext,
    PublishMessageType,
} from '@snode/common';


@Controller('/schat/channels')
export class STalkChannelsController {

    @Get()
    all() {
        return 'Hello';
    }

    @Get(':uid')
    one(ctx: IWebContext) {

    }

    @Post()
    create(ctx: IWebContext) {

    }
    @Post('/join/:uid')
    async join(ctx: IWebContext) {
        await ctx.user.store.set('currentChannel', ctx.params.uid);
        return {'status': 'success'}
    }
    @Post('/leave')
    async leave(ctx: IWebContext) {
        await ctx.user.store.remove('currentChannel');
        return {'status': 'success'}
    }

    @Delete()
    delete(ctx: IWebContext) {

    }
}

@Controller('/schat/:channel/messages')
export class STalkMessagesController {
    @Post()
    create(ctx: IWebContext) {
        ctx.snode.publish('schat.message', 'hi');
    }
}
/**
schat:
 - channelAdded
 - channelRemoved
 - channelUpdated
 - memberJoined
 - memberUpdated
 - memberLeft
 - messageSended

 - typingStarted
 - typingEnded

 - onMessageSend -> onMessageSent
 - onMessageRemove -> onMessageRemoved
 - onMessageUpdate -> onMessageUpdated
 - onChannelAdd -> onChannelAdd
 - onChannelUpdate -> onChannelUpdated
 */

@SocketController({ scope: 'stalk' })
export class STalkSocketController {

    @OnConnect({ context: true})
    async onConnect(context: ISocketContext, session: ISession) {
        await context.publish('stalk', { type: 'join'});
    }
    @OnDisconnect({ context: true })
    async onDisconnect(context: ISocketContext, session: ISession) {
        await context.publish('stalk', { type: 'leave'});
    }

    @OnPublish({
        topic: 'stalk',
        context: true,
        lock: true,
        raw: true,
    })
    async onChat(context: ISocketContext, session: ISession, message: any) {
        const { type, channel } = message;
        if (type === 'add') {
            await context.publish('stalk', message, {});
        }
    }
}
