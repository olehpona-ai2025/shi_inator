import { Context } from "grammy";

export interface CfContext extends Context {
    db: D1Database;
    executionCtx: ExecutionContext;
}