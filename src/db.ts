import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { JsonDB } from "node-json-db";
import { Data } from "./types";

export const db = new JsonDB(new Config("data", true, false, "/"));
export const oldData = db.getObject<Data>("/");
