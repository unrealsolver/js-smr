const nameRegExp = new RegExp(/[0-9A-Za-z_$]/);

export class Parser {
  constructor(code) {
    this.code = code;
    this.pos = 0;
    this.sym = null;
  }

  seek(pos) {
    if (!Number.isInteger(pos))
      throw Error(`pos should be a number; Received ${pos}`);
    this.pos = pos;
  }

  next() {
    return this.code.charAt(this.pos++);
  }

  readNameChar() {
    const sym = this.next();
    this.sym = sym;
    if (nameRegExp.test(this.sym)) {
      this.sym = sym;
      return sym;
    }
    this.sym = null;
    return null;
  }

  readName() {
    let name = "";
    while (this.readNameChar()) {
      name += this.sym;
    }
    if (name == "")
      throw new Error(
        `Can not read name at ${this.pos}. Context: "${this.code.slice(
          this.pos - 5,
          this.pos + 5
        )}"`
      );
    return name;
  }
}
