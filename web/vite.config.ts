import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import * as os from "node:os";

const localLoopbackAddresses = ["127.0.0.1", "localhost"];
const hostAddress = () => {
  return Object.values(os.networkInterfaces())
    .flatMap((net) => net ?? [])
    .find(
      (net) =>
        net.family === "IPv4" && !localLoopbackAddresses.includes(net.address),
    )?.address;
};
const apiHost = process.env.API_HOST ?? hostAddress() ?? "localhost";

// リクエスト発行先のアドレスをビルド時に決定可能にする
// ts/jsファイルから `import.meta.env.API_HOST` を評価することで取得できる
const define = {
  ["import.meta.env.API_HOST"]: JSON.stringify(apiHost),
} as const satisfies Record<string, unknown>;

export default defineConfig({
  plugins: [solid()],
  define,
});
