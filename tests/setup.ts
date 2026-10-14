import { mock } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import * as os from "node:os";
import { join } from "node:path";

delete process.env.NO_COLOR;
process.env.FORCE_COLOR = "1";

const carpetaTemporal = join(tmpdir(), "weather-cli-test");
rmSync(carpetaTemporal, { recursive: true, force: true });
mkdirSync(carpetaTemporal, { recursive: true });
process.env.HOME = carpetaTemporal;

mock.module("node:os", () => ({
  ...os,
  homedir: (): string => carpetaTemporal,
}));
