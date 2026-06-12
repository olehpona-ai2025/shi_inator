import { Context } from "grammy";
import { DbClient } from "./db/types";

export interface CfContext extends Context {
    db: DbClient;
    executionCtx: ExecutionContext;
}