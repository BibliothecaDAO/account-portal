import { syncBuiltinESMExports } from "node:module";
import net from "node:net";

const forbidden = () => {
  throw new Error(
    "Network access is forbidden during shadow import smoke test",
  );
};
net.Socket.prototype.connect = forbidden;
net.connect = forbidden;
net.createConnection = forbidden;
globalThis.fetch = forbidden;
syncBuiltinESMExports();
