import { IBundleContext } from '@odss/common';
import { WebServerEngineFactory, IWebServerEngine } from '@snode/common'

export class Activator {
    private engine: IWebServerEngine;

    async start(ctx: IBundleContext){
        const props = ctx.getProperty('snode', null);

        const reference = ctx.getServiceReference(WebServerEngineFactory, {name: props.engine});
        const serverFactory = ctx.getService(reference);

        this.engine = serverFactory.create({
            port: props.port,
            host: props.host,
        });
    }

    async stop() {
        this.engine.stop();
    }
}

export class NodeController {
    start() {

    }

    stop() {

    }
}
