const kCode = Symbol('code');
const messages = new Map();

function makeBotError(Base: ErrorConstructor | TypeErrorConstructor | RangeErrorConstructor) {
    return class BotError extends Base {
        constructor(key: string, ...args: any[]) {
            super(message(key, args));
            // @ts-ignore
            this[kCode] = key;
            if (Error.captureStackTrace) Error.captureStackTrace(this, BotError);
        }

        get name() {
            // @ts-ignore
            return `${super.name} [${this[kCode]}]`;
        }

        get code() {
            // @ts-ignore
            return this[kCode];
        }
    };
}

function message(key: string, args: any[]) {
    const msg = messages.get(key);
    if (!msg) throw new Error(`an invalid message key was used: ${key}`);
    if (typeof msg === 'function') return msg(...args);
    if (!args?.length) return msg;
    args.unshift(msg);
    return String(...args);
}

export function register(name: string, value: any) {
    messages.set(name, typeof value === 'function' ? value : String(value));
}

export const BotError = makeBotError(Error)
export const BotTypeError = makeBotError(TypeError)
export const BotRangeError = makeBotError(RangeError)