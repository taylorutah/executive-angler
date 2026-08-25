import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  beginEdit,
  cellKey,
  clearFlash,
  confirmEdit,
  displayValue,
  emptyEditState,
  isPending,
  rejectEdit,
  settle,
} from "./optimistic";

const KEY = cellKey("row-1", "length");

describe("optimistic edit", () => {
  it("shows the new value before the server has answered", () => {
    const s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    assert.equal(displayValue(s, "row-1", "length", "16"), "18");
    assert.equal(isPending(s, "row-1", "length"), true);
  });

  it("falls back to the server value for an untouched cell", () => {
    const s = emptyEditState<string>();
    assert.equal(displayValue(s, "row-1", "length", "16"), "16");
  });

  it("treats a no-op edit as not a write", () => {
    const s = emptyEditState<string>();
    const next = beginEdit(s, { rowId: "row-1", field: "length", previous: "16", next: "16" });
    assert.equal(next, s);
    assert.equal(isPending(next, "row-1", "length"), false);
  });
});

describe("a confirmed write flashes green", () => {
  it("flashes saved and stops being pending", () => {
    let s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    s = confirmEdit(s, "row-1", "length");
    assert.equal(s.flash[KEY], "saved");
    assert.equal(isPending(s, "row-1", "length"), false);
  });

  it("keeps the override until the server rows catch up, so the value cannot blink back", () => {
    let s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    s = confirmEdit(s, "row-1", "length");
    assert.equal(displayValue(s, "row-1", "length", "16"), "18");
  });

  it("ignores a confirmation for a write it is not holding", () => {
    const s = emptyEditState<string>();
    assert.equal(confirmEdit(s, "row-1", "length"), s);
  });
});

describe("a failed write flashes red and rolls back", () => {
  it("restores the previous value and records why", () => {
    let s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    s = rejectEdit(s, "row-1", "length", "Offline");
    assert.equal(displayValue(s, "row-1", "length", "16"), "16");
    assert.equal(s.flash[KEY], "error");
    assert.equal(s.errors[KEY], "Offline");
    assert.equal(isPending(s, "row-1", "length"), false);
  });

  it("clears a stale error when the angler tries again", () => {
    let s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    s = rejectEdit(s, "row-1", "length");
    s = beginEdit(s, { rowId: "row-1", field: "length", previous: "16", next: "19" });
    assert.equal(KEY in s.errors, false);
    assert.equal(KEY in s.flash, false);
    assert.equal(displayValue(s, "row-1", "length", "16"), "19");
  });
});

describe("flash is one-shot", () => {
  it("clears so a re-render cannot replay the animation", () => {
    let s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    s = confirmEdit(s, "row-1", "length");
    s = clearFlash(s, "row-1", "length");
    assert.equal(KEY in s.flash, false);
  });

  it("is a no-op when there is nothing to clear", () => {
    const s = emptyEditState<string>();
    assert.equal(clearFlash(s, "row-1", "length"), s);
  });
});

describe("settling against the server", () => {
  it("drops an override the server now agrees with", () => {
    let s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    s = confirmEdit(s, "row-1", "length");
    s = settle(s, { [KEY]: "18" });
    assert.equal(KEY in s.overrides, false);
    assert.equal(displayValue(s, "row-1", "length", "18"), "18");
  });

  it("does not let a stale refetch stomp a write that is still in flight", () => {
    const s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    const settled = settle(s, { [KEY]: "16" });
    assert.equal(displayValue(settled, "row-1", "length", "16"), "18");
  });

  it("keeps an override the server has not caught up to yet", () => {
    let s = beginEdit(emptyEditState<string>(), {
      rowId: "row-1",
      field: "length",
      previous: "16",
      next: "18",
    });
    s = confirmEdit(s, "row-1", "length");
    s = settle(s, { [KEY]: "16" });
    assert.equal(displayValue(s, "row-1", "length", "16"), "18");
  });
});
