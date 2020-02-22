import {
    IWebServerEngineFactory,
    IWebServerEngine,
    ServerOptionsType,
} from './types/server';

export class WebServerEngineFactory implements IWebServerEngineFactory {
    static readonly NAMESPACE = 'snode.common';

    create(options: ServerOptionsType): IWebServerEngine {
        throw new Error("Method not implemented.");
    }
}