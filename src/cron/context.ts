import { DbClient } from "@/db/types";
import { Api, RawApi } from "grammy";

export interface CronContext {
  api: Api<RawApi>;
  db: DbClient;
  executionCtx: ExecutionContext;
}
