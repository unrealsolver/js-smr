import test from "ava";
import { Queue } from "./queue.mjs";

test("Round-robin operation", (t) => {
  const queue = new Queue(5);
  queue.append(1);
  queue.append(2);
  queue.append(3);
  queue.append(4);
  queue.append(5);
  t.deepEqual(queue.items, [1, 2, 3, 4, 5]);
  queue.append(6);
  t.deepEqual(queue.items, [2, 3, 4, 5, 6]);
  queue.append(7);
  t.deepEqual(queue.items, [3, 4, 5, 6, 7]);
  queue.append(8);
  queue.append(9);
  queue.append(10);
  queue.append(11);
  t.deepEqual(queue.items, [7, 8, 9, 10, 11]);
});
