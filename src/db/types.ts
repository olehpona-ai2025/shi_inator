import { drizzle } from "drizzle-orm/d1";
export type DbClient = ReturnType<typeof drizzle>;
