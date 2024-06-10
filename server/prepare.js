import { spawnSync } from "child_process";
import os from "os";
import fs from "fs";

// Function to run commands depending on the OS
const runCommand = (command, args) => {
  const isWindows = os.platform() === "win32";
  const shell = isWindows ? true : false;
  const commandArgs = isWindows ? ["/C", command, ...args] : [...args];

  const result = spawnSync(isWindows ? "cmd" : command, commandArgs, {
    stdio: "inherit",
    shell,
  });

  return result.status;
};
