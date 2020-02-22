import { KoaServerEngineFactory } from '@snode/engine.koa';
import { getLogger, ConsoleHandler } from '@stool/logging';

import { WebSocketServerTransport } from './transport';
import { WampJsonSerializer } from './wamp/serializer';
import { WorkerController } from './worker/controller';

import * as chat from './chat';
import { TicketAuthResolver } from './auth';

const logger = getLogger('@snode/core');
logger.addHandler(new ConsoleHandler());

(async function() {

    const properties = {
        engine: 'koa',
        host: '0.0.0.0',
        port: 8081,
        websocket: true,
        broker: {
            type: 'nats',
            options: {

            }
        }
    };

    const workerController = new WorkerController(
        new KoaServerEngineFactory(),
        properties
    );

    await workerController.open();

    workerController.auth.addResolver(new TicketAuthResolver('test'));
    workerController.createRealm('realm1');
    workerController.createRealm('realm2');

    const scc = new chat.STalkChannelsController();
    const scm = new chat.STalkMessagesController();
    const scs = new chat.STalkSocketController();

    const dispose1 = workerController.addWebController(scc);
    const dispose2 = workerController.addSocketController(scs);

    setTimeout(() => {
        // console.log('timeout');
        // dispose1();
        // dispose2()
        // workerController.removeRealm('realm1');
    }, 2000)
})();

function getRequestProtocols(request: any) {
    let protocol = request.headers['sec-websocket-protocol'];
    if (protocol) {
        const names = protocol.split(',')
            .map(protocol => protocol.trim())
            .filter(protocol => protocol);
        if (names.length > 0) {
            return names;
        }
    }
    return [];
}