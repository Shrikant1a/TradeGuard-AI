const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const rootDir = path.resolve(__dirname, "..");

// Locate python executable (check venv first, then system python)
function getPythonCommand() {
  const candidates = [
    path.join(rootDir, "backend", "venv", "Scripts", "python.exe"),
    path.join(rootDir, "backend", "venv", "bin", "python"),
    path.join(rootDir, "venv", "Scripts", "python.exe"),
    path.join(rootDir, "venv", "bin", "python"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Fallback to system python
  return process.platform === "win32" ? "python" : "python3";
}

const pythonCmd = getPythonCommand();
const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

const args = process.argv.slice(2);
const backendOnly = args.includes("--backend-only");
const frontendOnly = args.includes("--frontend-only");

console.log("\x1b[1m\x1b[34m=== TradeGuard AI Unified Dev Runner ===\x1b[0m");
console.log(`Python runtime: ${pythonCmd}`);

const children = [];

function prefixStream(stream, prefix, colorCode) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${colorCode}${prefix}\x1b[0m ${line}`);
      }
    }
  });
  stream.on("end", () => {
    if (buffer.trim()) {
      console.log(`${colorCode}${prefix}\x1b[0m ${buffer}`);
    }
  });
}

function startBackend() {
  console.log("\x1b[36m[TradeGuard] Starting FastAPI backend on http://127.0.0.1:8000...\x1b[0m");
  const backendProc = spawn(
    pythonCmd,
    ["-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
    {
      cwd: rootDir,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      shell: false,
    }
  );

  prefixStream(backendProc.stdout, "[BACKEND]", "\x1b[36m");
  prefixStream(backendProc.stderr, "[BACKEND]", "\x1b[36m");

  backendProc.on("error", (err) => {
    console.error("\x1b[31m[BACKEND ERROR]\x1b[0m", err.message);
  });

  children.push(backendProc);
  return backendProc;
}

function startFrontend() {
  console.log("\x1b[35m[TradeGuard] Starting Next.js frontend on http://localhost:3000...\x1b[0m");
  const frontendDir = path.join(rootDir, "frontend");
  const binDir = path.join(frontendDir, "node_modules", ".bin");
  const envPath = `${binDir}${path.delimiter}${process.env.PATH || ""}`;

  const frontendProc = spawn(npmCmd, ["run", "dev"], {
    cwd: frontendDir,
    env: { ...process.env, PATH: envPath },
    shell: true,
  });

  prefixStream(frontendProc.stdout, "[FRONTEND]", "\x1b[35m");
  prefixStream(frontendProc.stderr, "[FRONTEND]", "\x1b[35m");

  frontendProc.on("error", (err) => {
    console.error("\x1b[31m[FRONTEND ERROR]\x1b[0m", err.message);
  });

  children.push(frontendProc);
  return frontendProc;
}

if (!frontendOnly) {
  startBackend();
}

if (!backendOnly) {
  // Give backend 500ms head start for clean init
  setTimeout(() => {
    startFrontend();
  }, 500);
}

function shutdown() {
  console.log("\n\x1b[33mShutting down TradeGuard AI services...\x1b[0m");
  for (const child of children) {
    if (child && !child.killed) {
      try {
        if (isWin && child.pid) {
          execSync(`taskkill /F /T /PID ${child.pid}`, { stdio: "ignore" });
        } else {
          child.kill("SIGTERM");
        }
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
