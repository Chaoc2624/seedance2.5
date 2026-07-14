#!/usr/bin/env bun
/**
 * Reads build_all_bodies.py string variables by executing a transformed version,
 * OR simply: re-exports by importing from sibling md files if present.
 *
 * Primary path: execute the python builder via child_process.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const py = join(dir, "build_all_bodies.py");
const r = spawnSync("python3", [py], { cwd: dir, encoding: "utf-8" });
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
process.exit(r.status ?? 1);
