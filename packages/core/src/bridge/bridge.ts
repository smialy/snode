import { IBridge, IBridgeTransport, IUnsubscribe, IUnregister } from '../types';

export class PrefixBridge implements IBridge {
    constructor(private transport: IBridgeTransport, private prefix: string) {

    }
    publish(subject: string, data: any): Promise<void> {
        return this.transport.publish(this.normalizeSubject(subject), data);
    }
    subscribe(subject: string, handler: Function): Promise<IUnsubscribe> {
        return this.transport.subscribe(this.normalizeSubject(subject), handler);
    }
    call(subject: string, args: any[]): Promise<void> {
        return this.transport.call(this.normalizeSubject(subject), args);
    }
    register(subject: string, handler: Function): Promise<IUnregister> {
        return this.transport.register(this.normalizeSubject(subject), handler);
    }
    private normalizeSubject(subject: string): string {
        return `${this.prefix}.${subject}`;
    }
}