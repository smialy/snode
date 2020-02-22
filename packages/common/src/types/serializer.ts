
export interface ISerializer {
    readonly type: string;

    serialize(msg: any): string;
    unserialize(payload: string): any;
}