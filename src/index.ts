import type { MiddlewareHandler } from "hono";
const randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

declare module 'hono' {
    interface ContextVariableMap {
        correlationId: string
    }
};

export type correlationIdOptions = {
    header?: string,
    generator?: () => string,
    validator?: (correlationId: string) => boolean
};

export const _defaultOptions: Required<correlationIdOptions> = {
    header: 'x-correlation-id',
    generator: () => randomUUID(),
    validator: (c) => !!c
};

export const useCorrelationId = (options: correlationIdOptions = _defaultOptions): MiddlewareHandler => {
    const merged = { ..._defaultOptions, ...options };
    return async function useCorrelationId(c, next) {
        let headerId = c.req.header(merged.header) || merged.generator();
        if (merged.validator && !merged.validator(headerId)) {
            headerId = merged.generator();
        }
        c.set('correlationId', headerId);
        await next();
        c.res.headers.set(merged.header, headerId);
    }
};
