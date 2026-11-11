// Starts the real server (src/main.ts) with a small site and checks that malformed requests get an
// error response instead of crashing the process, which would take the whole site down.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { request } from "node:http";

const here = dirname(fileURLToPath(import.meta.url));
const port = 18000 + Math.floor(Math.random() * 2000);
let server: ChildProcess;
let siteDir: string;

/** Sends the request target exactly as given (no URL normalisation). */
function get(target: string): Promise<number> {
  return new Promise((done, fail) => {
    const req = request({ host: "127.0.0.1", port, path: target, method: "GET" }, (res) => {
      res.resume();
      res.on("end", () => done(res.statusCode ?? 0));
    });
    req.on("error", fail);
    req.end();
  });
}

before(async () => {
  siteDir = mkdtempSync(join(tmpdir(), "yivi-site-"));
  writeFileSync(join(siteDir, "index.html"), "<h1>home</h1>");
  writeFileSync(join(siteDir, "404.html"), "<h1>not found</h1>");
  server = spawn(process.execPath, [resolve(here, "../src/main.ts")], {
    env: { ...process.env, PORT: String(port), SITE_DIR: siteDir },
    stdio: "ignore",
  });
  // Wait until the docs are loaded, so /mcp/images is reachable too.
  for (let i = 0; i < 200; i++) {
    if (await get("/healthz").catch(() => 0) === 200) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("server did not become ready");
});

after(() => {
  server.kill();
  rmSync(siteDir, { recursive: true, force: true });
});

test("malformed requests do not crash the server", async () => {
  assert.equal(await get("/"), 200);
  for (const target of ["//", "///x", "/%E0%A4%A", "/mcp/images/%E0%A4%A", "/mcp/images/..%2f..%2fetc/passwd"]) {
    const status = await get(target);
    assert.ok(status >= 400 && status < 500, `${target}: ${status}`);
  }
  assert.equal(server.exitCode, null, "server still running");
  assert.equal(await get("/"), 200);
  assert.equal(await get("/healthz"), 200);
});
