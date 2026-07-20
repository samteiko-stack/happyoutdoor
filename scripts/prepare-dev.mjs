import { execSync } from "node:child_process";

const port = process.env.PORT ?? "3002";
const force = process.argv.includes("--force");

function getListeningNodePids() {
  try {
    const lines = execSync(`lsof -iTCP:${port} -sTCP:LISTEN -n -P`, {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .slice(1);

    return lines
      .filter((line) => line.includes("node"))
      .map((line) => line.trim().split(/\s+/)[1])
      .filter(Boolean);
  } catch {
    return [];
  }
}

const nodePids = getListeningNodePids();

if (nodePids.length === 0) {
  process.exit(0);
}

if (!force) {
  console.error(
    `Port ${port} is already in use (PID ${nodePids.join(", ")}).\n` +
      `Open http://localhost:${port} — the app is probably already running.\n` +
      `To restart cleanly: npm run dev:clean`
  );
  process.exit(1);
}

for (const pid of nodePids) {
  try {
    process.kill(Number(pid), "SIGTERM");
  } catch {
    // Process may have already exited.
  }
}
execSync("sleep 1");
console.log(`Freed port ${port}.`);
