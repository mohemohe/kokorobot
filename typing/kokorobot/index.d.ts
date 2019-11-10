import {Robot as HubotRobot, Response as HubotResponse, Message as HubotMessage} from "hubot";

export interface Robot<T> extends HubotRobot<T> {
    kokoro: {
        util: any;
    };
    catchAll(callback: Callback<this>): void;
    catchAll(options: any, callback: Callback<this>): void;
    hear(regex: RegExp, callback: Callback<this>): void;
    hear(regex: RegExp, options: any, callback: Callback<this>): void;
    helpCommands(): string[];
    loadFile(directory: string, fileName: string): void;
    respond(regex: RegExp, callback: Callback<this>): void;
    respond(regex: RegExp, options: any, callback: Callback<this>): void;
    enter(callback: Callback<this>): void;
    enter(options: any, callback: Callback<this>): void;
    topic(callback: Callback<this>): void;
    topic(options: any, callback: Callback<this>): void;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
    send(...options: any): void;
    load(target: string): void;
}

type Callback<T> = (response: Response<T>) => void;

export interface Response<T> extends HubotResponse<T> {
    match: RegExpMatchArray;
    message: Envelope["message"] & HubotMessage;
    envelope: Envelope;
}

interface Envelope {
    room: string;
    message: {
        room: string;
        text: string;
        rawMessage: {
            text: string;
            username: string;
            icons: {
                image_512: string;
                image_128: string;
                image_64: string;
                image_48: string;
                image_32: string;
            };
        };
    };
    user: {
        slack?: {
            real_name: string;
            profile: {
                image_512: string;
                image_128: string;
                image_64: string;
                image_48: string;
                image_32: string;
            };
        };
    };
}
