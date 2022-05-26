export default class Logger {
  constructor(filename) {
    this.filename = filename;
    this.trailingLf = true;
  }

  requireLf() {
    if (this.trailingLf === false) console.log();
  }

  log(...msg) {
    this.requireLf();
    console.log(`[${this.filename}] `, ...msg);
    this.trailingLf = true;
  }

  error(...msg) {
    this.requireLf();
    console.error(...msg);
    this.trailingLf = true;
  }

  dot() {
    process.stdout.write(".");
    this.trailingLf = false;
  }
}
