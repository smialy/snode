import { ISerializer } from "./types/serializer";

export class JSONSerializer implements ISerializer {
    type: string = 'json';

    serialize(payload: any): string {
        return JSON.stringify(payload);
    }
    unserialize(payload: string): any {
        return JSON.parse(payload);
    }
}

export class RawSerializer implements ISerializer {
    type: string = 'raw';

    serialize(payload: any): string {
        return payload;
    }
    unserialize(payload: string): any {
        return payload;
    }
}