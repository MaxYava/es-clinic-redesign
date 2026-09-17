import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "4180"], {
  stdio: "inherit",
  env: { ...process.env, HERO_REBUILD: "1" },
});
child.on("exit", code => process.exit(code ?? 0));
