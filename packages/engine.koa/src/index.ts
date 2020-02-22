import { IBundleContext } from '@odss/common';
import { WebServerEngineFactory } from '@snode/common';

import { KoaServerEngineFactory } from './koa-engine';

export class Activator {
    async start(ctx: IBundleContext){
        ctx.registerService(
            WebServerEngineFactory,
            new KoaServerEngineFactory(),
            { name: 'koa' }
        );
    }
    async stop(ctx: IBundleContext) {
    }
}

export { KoaServerEngineFactory };