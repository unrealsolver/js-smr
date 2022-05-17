#!/usr/bin/env node
import * as fs from "fs";
import { ArgumentParser } from "argparse";
import { restore } from "./lib/core.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { version, description } = require("./package.json");

const parser = new ArgumentParser({ description });
parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("min_file", { help: "Path to minified .js file" });
parser.add_argument("map_file", {
  nargs: "?",
  help: "Override path to .map file",
});

const args = parser.parse_args();
if (args.map_file === undefined) {
  if (!args.min_file.endsWith(".js")) {
    console.error(`${args.min_file} is not JS file!`);
    process.exit(1);
  }
  args.map_file = args.min_file + ".map";
}

const content = fs.readFileSync(args.min_file, "utf-8");
const mapContent = fs.readFileSync(args.map_file, "utf-8");

const restored = await restore(content, mapContent);

process.stdout.write(restored);
