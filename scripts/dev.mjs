import { execFileSync, spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { platform } from "node:process";

const workspaceRoot = process.cwd();
const nodeBin = process.execPath;
const rootViteCli = resolve(workspaceRoot, "node_modules", "vite", "bin", "vite.js");
const convAiRoot = resolve(workspaceRoot, "Tools", "ConvAI");
const convAiFrontendRoot = resolve(convAiRoot, "artifacts", "interview-app");
const convAiFrontendViteCli = resolve(convAiFrontendRoot, "node_modules", "vite", "bin", "vite.js");
const convAiPython = platform === "win32"
  ? resolve(convAiRoot, ".venv", "Scripts", "python.exe")
  : resolve(convAiRoot, ".venv", "bin", "python");

const managedServices = [
  {
    name: "convai-backend",
    command: convAiPython,
    args: ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"],
    cwd: join(convAiRoot, "backend"),
    port: 8003,
    commandLineMarkers: [convAiRoot, "uvicorn", "8003"],
  },
  {
    name: "convai-frontend",
    command: nodeBin,
    args: [convAiFrontendViteCli, "--host", "0.0.0.0", "--port", "3003", "--strictPort"],
    cwd: convAiFrontendRoot,
    port: 3003,
    commandLineMarkers: [convAiFrontendRoot, "vite"],
  },
  {
    name: "home",
    command: nodeBin,
    args: [rootViteCli, "--host", "0.0.0.0", "--strictPort"],
    cwd: workspaceRoot,
    port: 5173,
    commandLineMarkers: [workspaceRoot, "vite"],
  },
];

function getListeningPids(port) {
  if (platform !== "win32") {
    return [];
  }

  try {
    const output = execFileSync("powershell", [
      "-NoProfile",
      "-Command",
      `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`,
    ], { encoding: "utf8" });

    return output
      .split(/\r?\n/)
      .map((line) => Number.parseInt(line.trim(), 10))
      .filter((pid) => Number.isFinite(pid));
  } catch {
    return [];
  }
}

function killPid(pid) {
  try {
    execFileSync("powershell", ["-NoProfile", "-Command", `Stop-Process -Id ${pid} -Force`], { stdio: "ignore" });
  } catch {
    // Ignore process-race failures; the port check below will decide whether to continue.
  }
}

function getProcessCommandLine(pid) {
  if (platform !== "win32") {
    return "";
  }

  try {
    return execFileSync("powershell", [
      "-NoProfile",
      "-Command",
      `(Get-CimInstance Win32_Process -Filter \"ProcessId=${pid}\").CommandLine`,
    ], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function isManagedProcess(commandLine, markers) {
  const normalizedCommandLine = commandLine.toLowerCase();
  return markers.every((marker) =>
    normalizedCommandLine.includes(String(marker).toLowerCase()));
}

for (const service of managedServices) {
  for (const pid of getListeningPids(service.port)) {
    const commandLine = getProcessCommandLine(pid);
    if (isManagedProcess(commandLine, service.commandLineMarkers)) {
      killPid(pid);
    }
  }
}

let browserOpened = false;
let bufferedOutput = "";

function openBrowser(url) {
  if (process.env.NO_BROWSER === "1") {
    return;
  }
  if (browserOpened) {
    return;
  }
  browserOpened = true;

  const opener =
    platform === "win32"
      ? spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true, shell: true })
      : platform === "darwin"
        ? spawn("open", [url], { stdio: "ignore", detached: true, shell: false })
        : spawn("xdg-open", [url], { stdio: "ignore", detached: true, shell: false });

  opener.unref();
}

function inspectOutput(chunk) {
  bufferedOutput += chunk.toString();
  const localUrlMatch = bufferedOutput.match(/Local:\s+(http:\/\/[^\s]+)/i) || bufferedOutput.match(/http:\/\/127\.0\.0\.1:\d+\//i) || bufferedOutput.match(/http:\/\/localhost:\d+\//i);

  if (localUrlMatch) {
    const url = localUrlMatch[1] || localUrlMatch[0];
    openBrowser(url.endsWith("/") ? url : `${url}/`);
  }

  process.stdout.write(chunk);
}

const childProcesses = managedServices.map((service) => {
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
    env: { ...process.env },
  });

  child.stdout.on("data", (chunk) => {
    if (service.name === "home") {
      inspectOutput(chunk);
      return;
    }
    process.stdout.write(`[${service.name}] ${chunk}`);
  });
  child.stderr.on("data", (chunk) => process.stderr.write(`[${service.name}] ${chunk}`));

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }
    if (signal) {
      shutdown(1);
      return;
    }
    if (code && code !== 0) {
      process.stderr.write(`[${service.name}] exited with code ${code}\n`);
      shutdown(code);
    }
  });

  return child;
});

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }
  setTimeout(() => process.exit(exitCode), 500);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
