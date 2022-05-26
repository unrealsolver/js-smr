import test from "ava";
import textNav from "./text-navigation.mjs";

test("Test text navigation", (t) => {
  const text = "abc\ndef\nghk\n";
  const nav = textNav(text);
  t.is(text.charAt(nav(1, 1)), "a");
  t.is(text.charAt(nav(2, 1)), "d");
  t.is(text.charAt(nav(2, 2)), "e");
  t.is(text.charAt(nav(3, 2)), "h");
  t.is(text.charAt(nav(2, 2)), "e");
  t.is(text.charAt(nav(2, 1)), "d");
  t.is(text.charAt(nav(1, 1)), "a");
});
