import chalk from "chalk";
import { SourceMapConsumer } from "source-map";

import Logger from "./logger.mjs";
import { Parser } from "./parser.mjs";
import { Queue } from "./queue.mjs";
import textNavigation from "./text-navigation.mjs";
import offsetCalculator from "./naiveLineOffsetCalculator.mjs";

const logger = new Logger(import.meta.url.split("/").slice(-1)[0]);
const oc = offsetCalculator();

function mappingId(mapping) {
  return `${mapping.originalLine}:${mapping.originalColumn}`;
}

export async function restore(content, mapContent, args) {
  return await SourceMapConsumer.with(mapContent, null, (consumer) => {
    let offset = 0;
    let restored = content;
    let stats = {
      visited: 0,
      replaced: 0,
      skipped: 0,
    };
    const visited = new Set();
    const history = new Queue(20);
    let inrecoverableState = false;

    const ignorable = new Set(["get", "set", "async", "ee"]);
    const reserved2char = new Set(["in", "of"]);

    function displayHistory() {
      history.items.map((d) => logger.log(d));
    }

    consumer.eachMapping((mapping) => {
      if (mapping.generatedName === "m") {
        throw new Exception();
      }
      stats.visited++;
      const nav = textNavigation(restored);
      if (inrecoverableState) return;
      // Skip mappings without a name.
      if (mapping.name === null) return;
      const parser = new Parser(restored);
      let line = mapping.generatedLine;
      offset = oc.at(mapping.generatedLine);
      let pos = nav(mapping.generatedLine, mapping.generatedColumn) + offset;
      parser.seek(mapping.generatedLine, mapping.generatedColumn + offset);

      function explainPos(code, line, col) {
        const msg =
          col < 21 ? `┃<- ${col} `.padStart(col) : `${col} ->┃`.padStart(21);
        return chalk.yellow(msg);
      }

      function explain(code, pos, mapping, generatedName) {
        return (
          "\n" +
          `LINE: ${chalk.yellow(line)} OFST: ${chalk.yellow(
            offset
          )} COL: ${chalk.yellow(mapping.generatedColumn)} ` +
          chalk.red(generatedName || "???") +
          " -> " +
          chalk.green(mapping.name) +
          "\n" +
          code.slice(pos - 20, pos) +
          chalk.redBright(code.slice(pos, pos + generatedName.length)) +
          code.slice(pos + generatedName.length, pos + 40) +
          "\n" +
          explainPos(code, line, pos) +
          ""
        );
      }

      const hash = mappingId(mapping);
      //console.log(hash)
      if (visited.has(hash)) {
        if (args.verbose > 0) {
          logger.error(
            `Skipping visited mapping for token "${chalk.yellow(mapping.name)}"`
          );
        }
        stats.skipped++;
        return;
      }
      visited.add(hash);

      let generatedName = "";
      try {
        generatedName = parser.readName();
        //logger.log(generatedName)
      } catch (e) {
        if (restored[pos] == "*") {
          try {
            logger.log(
              `Processing generator function "${chalk.cyan(
                "*" + mapping.name
              )}"`
            );
            pos++;
            parser.seek(pos);
            generatedName = parser.readName();
          } catch (e) {
            logger.error(explain(restored, pos, mapping, generatedName));
            throw e;
          }
        } else if (restored[pos] == "(") {
          try {
            logger.log(
              `Skipping inlined function "${chalk.cyan(mapping.name)}"`
            );
            return;
            pos++;
            parser.seek(pos);
            generatedName = parser.readName();
          } catch (e) {
            logger.error(explain(restored, pos, mapping, generatedName));
            throw e;
          }
        } else {
          logger.error(`${chalk.red("Failed to read a token")}`);
          logger.log(mapping);
          logger.log(explain(restored, pos, mapping, generatedName));
          //logger.log(explain(restored, pos, mapping, generatedName))
          try {
            logger.log(chalk.red("Trying to use +1 offset"));
            pos++;
            parser.seek(pos);
            generatedName = parser.readName();
          } catch (e) {
            logger.error(explain(restored, pos, mapping, generatedName));
            logger.error(e);
            inrecoverableState = true;
            throw e;
          }
        }
      }
      //logger.log(mapping)
      //logger.log(explain(restored, pos, mapping, generatedName))
      if (mapping.name == generatedName) return;
      if (generatedName.length > 1) {
        // Skip numeric (inlined literal)
        if (!Number.isNaN(Number(generatedName))) {
          logger.log(
            `Skipping inlined numeric literal "${chalk.yellow(
              generatedName
            )}". Original value ${chalk.yellow(mapping.name)}`
          );
          return;
        }
        // Skip possible 2-char mangled names
        if (generatedName.length == 2) {
          if (!reserved2char.has(generatedName)) return;
        }
        // Skip ignorable (set, await, get, etc)
        if (ignorable.has(generatedName)) {
          logger.log(`Ignoring token "${chalk.yellow(generatedName)}"`);
          return;
        }
        logger.log(explain(restored, pos, mapping, generatedName));
        logger.error(
          `${chalk.red("ERROR")} Cannot handle token "${
            mapping.name
          }". Token is TOO POWERFULL`
        );
        logger.error("Skipping for now...");
        logger.error(`Unknown token "${generatedName}" at ${pos}`);
        inrecoverableState = true;
        throw new Error(`Unknown token "${generatedName}" at ${pos}`);
        return;
        // Skip previous token
        const additionalOffset = generatedName.length + 1;
        offset += additionalOffset;
        console.log(chalk.green(`+${additionalOffset}`));
        pos += additionalOffset;
        generatedName = parser.readName();
        logger.log(
          `New token is "${chalk.yellow(generatedName)}". Cursor at ${pos}`
        );
        logger.log(
          explainPos(restored, 0, pos) +
            "\n" +
            restored.slice(pos - 20, pos + 20)
        );
      }
      if (mapping.name == generatedName) {
        offset -= mapping.name.length + 1;
        pos -= mapping.name.length + 1;
        logger.log(explain(restored, pos, mapping, generatedName));
        return;
      }
      if (generatedName.length > 1) {
        logger.log(chalk.green("GENERATED"), generatedName);
        logger.log(mapping);
        logger.log(restored.slice(pos - 20, pos + 20));
      }
      const origPos = nav(mapping.generatedLine, mapping.generatedColumn);
      restored =
        restored.slice(0, origPos + offset) +
        mapping.name +
        restored.slice(origPos + offset + generatedName.length);
      stats.replaced++;
      //logger.log(generatedName, mapping.name, restored.slice(pos - 5, pos + mapping.name.length + 5))
      const incr = mapping.name.length - 1;
      //logger.log("Offset " + chalk.green("+" + incr))
      oc.add(mapping.generatedLine, incr);
      logger.dot();
      //console.log(explain(restored, pos, mapping, generatedName))
    });
    logger.log("DONE!");
    logger.log(stats);
    return restored;
  });
}
