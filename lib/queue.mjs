export class Queue {
  /**
   * Round Robin Queue
   */
  constructor(size) {
    this.size = size;
    this.data = new Array(this.size);
    this.head = 0;
  }

  append(item) {
    this.data[this.head] = item;
    if (this.head === this.size - 1) {
      this.head = 0;
    } else {
      this.head++;
    }
  }

  get items() {
    return this.data.slice(this.head).concat(this.data.slice(0, this.head));
  }
}
