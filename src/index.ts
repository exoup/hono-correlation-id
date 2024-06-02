import { randomUUID } from "node:crypto";
import type { MiddlewareHandler } from "hono";

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

const _defaultOptions: Required<correlationIdOptions> = {
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
