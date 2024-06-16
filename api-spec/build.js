import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { spawn } from "node:child_process";
import path from "node:path";
import { access, constants, lstat, readdir } from "node:fs/promises";

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<string>} Command output text
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (data) => {
      stdout.push(data);
    });
    child.stderr.on("data", (data) => {
      stderr.push(data);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Command(${command}) failed with exit code ${code}.\nstderr: ${stderr.join("")}`,
          ),
        );
      } else {
        resolve(stdout.join(""));
      }
    });
  });
}

const dirname = import.meta.dirname;
const openapiYaml = path.join(
  dirname,
  "tsp-output",
  "@typespec",
  "openapi3",
  "openapi.yaml",
);

const tspSrc = path.join(dirname, "main.tsp");

/**
 * @param {"rust-axum" | "typescript-fetch"} generatorName
 * @param {string} dest
 */
function runGenerator(generatorName, dest) {
  return runCommand("openapi-generator-cli", [
    "generate",
    "--input-spec",
    openapiYaml,
    "--generator-name",
    generatorName,
    "--output",
    dest,
  ]);
}

/**
 * @param {Date[]} dates
 * @returns {Date | undefined}
 */
function max(dates) {
  if (dates.length === 0) {
    return;
  }
  let maxDate = new Date("0000-01-01");
  for (const date of dates) {
    if (maxDate < date) {
      maxDate = date;
    }
  }
  return maxDate;
}

/**
 * @param {string} filePath
 */
const getCtime = (filePath) =>
  lstat(filePath).then(async (stat) => {
    if (stat.isDirectory()) {
      const files = await readdir(filePath, { recursive: true });
      const ctimes = files
        .map((fileName) => path.join(filePath, fileName))
        .map((filePath) => lstat(filePath).then((stat) => stat.ctime));
      return max(await Promise.all(ctimes));
    }
    return stat.ctime;
  });

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
  } catch {
    return false;
  }
  return true;
}

/**
 * @param {string} src
 * @param {string} dest
 * @returns {Promise<boolean>}
 */
async function srcUpdated(src, dest) {
  if (!(await exists(dest))) {
    return true;
  }
  const srcCtime = getCtime(src);
  const destCtime = getCtime(dest);
  return (
    ((await srcCtime) ?? new Date("0000-01-01")) >
    ((await destCtime) ?? new Date("0000-01-01"))
  );
}

async function buildOpenApiYaml() {
  if (await srcUpdated(tspSrc, openapiYaml)) {
    console.log(await runCommand("pnpm", ["tsp", "compile", "."]));
  }
}

async function buildAxumClient() {
  await buildOpenApiYaml();
  const dest = path.join(dirname, "axum-client");
  if (await srcUpdated(openapiYaml, dest)) {
    console.log(await runGenerator("rust-axum", dest));
  }
}

async function buildTypeScriptClient() {
  await buildOpenApiYaml();
  const dest = path.join(dirname, "ts-client");
  if (await srcUpdated(openapiYaml, dest)) {
    console.log(await runGenerator("typescript-fetch", dest));
  }
}

yargs(hideBin(process.argv))
  .command("openapi", "Build openapi schema file", buildOpenApiYaml)
  .command("axum-client", "Build axum client files", buildAxumClient)
  .command("ts-client", "Build typescript client files", buildTypeScriptClient)
  .command("all", "Build all client files", async () => {
    await buildAxumClient();
    await buildTypeScriptClient();
  })
  .strict()
  .parse();
