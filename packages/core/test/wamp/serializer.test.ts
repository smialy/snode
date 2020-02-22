import { assert } from 'chai';
import { WampJsonSerializer } from '../../src/wamp/serializer';

describe('Wamp', () => {
    const serializer = new WampJsonSerializer();

    describe('Serializer', () => {
        describe('HelloMessage', () => {
            it('should unserialize to HelloMessage', () => {
                const wamp = '[1,"realm1",{"roles":{},"authmethods":["ticket"],"authid":"user1"}]';
                const message = serializer.unserialize(wamp);
                assert.deepEqual(message, {
                    type: 'hello',
                    realm: 'realm1',
                    details: { authid: 'user1', authmethods: [ 'ticket' ] }
                });
            });
        });
        describe('WelcomeMessage', () => {
            it('should serialize to WelcomeMessage', () => {
                const message = { type: 'welcome', session: 5904030747999060, details: {} };
                const wamp = serializer.serialize(message);
                assert.equal(wamp, '[2,5904030747999060,{"roles":{"broker":{},"dealer":{}}}]');
            });
        });
        describe("GoodbyeMessage", () => {
            it('should unserialize', () => {
                const wamp = '[6,{"message": "The host is shutting down now."},"close.system_shutdown"]';
                const message = serializer.unserialize(wamp);
                assert.deepEqual(message, {
                    type: 'goodbye',
                    reason: 'close.system_shutdown',
                    message: "The host is shutting down now."
                });
            });
            it('should serialize', () => {
                const message = {
                    type: 'goodbye',
                    reason: 'close.system_shutdown',
                    message: "The host is shutting down now."
                };
                const wamp = serializer.serialize(message);
                assert.equal(wamp, '[6,{"message":"The host is shutting down now."},"close.system_shutdown"]');
            });
        });
        describe("AbortMessage", () => {
            it('should unserialize', () => {
                const wamp = '[3,{"message":"Incorrect realm name."},"error.no_such_realm"]';
                const message = serializer.unserialize(wamp);
                assert.deepEqual(message, {
                    type: 'abort',
                    reason: 'error.no_such_realm',
                    message: "Incorrect realm name.",
                });
            });
            it('should serialize', () => {
                const message = {
                    type: 'abort',
                    reason: 'error.no_such_realm',
                    message: "Incorrect realm name."
                };
                const wamp = serializer.serialize(message);
                assert.equal(wamp, '[3,{"message":"Incorrect realm name."},"error.no_such_realm"]');
            });
        });
    });
  });
