import 'reflect-metadata';

import { WebRouteType, MetadataControllerKeys } from '@snode/common';
import { scanFromPrototype } from '../utils/meta-scanner';

export function scanForRoutes(controller): WebRouteType[] {
    const prototype = Object.getPrototypeOf(controller);
    const options = Reflect.getMetadata(MetadataControllerKeys.WEB_CONTROLLER, prototype.constructor);
    const routes = scanFromPrototype<any, WebRouteType>(prototype, name => {
        const handler = prototype[name];
        const meta = Reflect.getMetadata(MetadataControllerKeys.WEB_HANDLER, handler);
        if (meta) {
            const { path, method } = meta;
            return {
                path: joinUrl(options.path, path),
                method,
                name,
                handler: handlerResponse(handler.bind(controller)),
            }
        }
    });
    return routes;
}

const handlerResponse = handler => (ctx, next) => {
    const result = handler(ctx, next);
    const type = typeof result;
    if (type !== 'undefined') {
        if (type === 'string') {
            ctx.body = result;
        } else {
            ctx.set('Content-Type', 'application/json');
            ctx.body =  JSON.stringify(result);
        }
    }
};

const joinUrl = (...args) => {
    const clean = part => part.replace(/^\/+|\/+$/g, '');
    const url = args.filter(part => part).map(clean).join('/');
    return url[0] === '/' ? url : `/${url}`;
};

export function scanForSocketRoutes(instance: any) {
    const prototype = Object.getPrototypeOf(instance);
    const options = Reflect.getMetadata(MetadataControllerKeys.SOCKET_CONTROLLER, prototype.constructor);
    const handlers = scanFromPrototype(prototype, name => {
        const handler = prototype[name];
        const meta = Reflect.getMetadata(MetadataControllerKeys.SOCKET_HANDLER, handler);
        if (meta) {
            return {
                name,
                ...meta,
            };
        }
    });
    return {
        instance,
        options,
        handlers,
    };
}