import { IUnregister, IUnsubscribe, IBridge, IBridgeTransport } from '../types';

let natsPackage: any = null;

type NatsProxyOptionsType = {
    url?: string;
    name?: string;
    // user?: string;
    // pass?: string;
    // servers?: string[];
    // pedantic?: boolean;
    // queue?: string;
}
export type CallOptions = {
    timeout?: number,
}
export class NatsBridge implements IBridgeTransport {

    private client: any;
    constructor(private options: NatsProxyOptionsType = {}) {
    }
    async connect(): Promise<void> {
        if (natsPackage === null) {
            natsPackage = await import('nats');
        }
        return new Promise((resolve, reject) => {
            if (!this.client) {
                this.client = natsPackage.connect({ ...this.options, json: true});
                this.client.once('connect', () => {
                    this.client.off('error', reject);
                    resolve();
                });
                this.client.on('error', reject);
            } else {
                resolve();
            }
        });
    }
    publish(subject: string, data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client.publish(subject, data);
                resolve();
            } catch(e) {
                reject(e);
            }
        });
    }
    subscribe(subject: string, handler: Function): Promise<IUnsubscribe> {
        return new Promise((resolve, reject) => {
            const sid = this.client.subscribe(subject, handler);
            resolve(() => this.client.unsubscribe(sid));
        });
    }
    call(subject: string, args: any[], options: CallOptions = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(args)) {
                args = [args];
            }
            this.client.request(subject, args, options, msg => {
                if (msg instanceof natsPackage.NatsError) {
                    reject(msg);
                } else {
                    resolve(msg);
                }
            });
        });
    }
    register(subject: string, handler: Function): Promise<IUnregister> {
        return new Promise((resolve, reject) => {
            const sid = this.client.subscribe(subject, async (msg, reply) => {
                if (reply) {
                    const result = await handler(msg);
                    this.client.publish(reply, result);
                }
            });
            resolve(() => this.client.unsubscribe(sid));
        });
    }
    close(): Promise<void> {
        return new Promise(resolve => {
            if (this.client) {
                this.client.flush(() => {
                    this.client.close();
                    resolve();
                });
            }
            this.client = null;
        })
    }
}