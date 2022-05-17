export default class Logger {
  constructor() {
    this.trailingLf = true;
  }

  requireLf() {
    if (this.trailingLf === false) console.log();
  }

  log(...msg) {
    this.requireLf();
    console.log(...msg);
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
