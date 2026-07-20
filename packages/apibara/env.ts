import { parseApibaraEnvironment } from "./environment";

export const env = parseApibaraEnvironment(process.env);

export type { ApibaraEnvironment as Env } from "./environment";
