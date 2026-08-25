import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WORKBENCH_KEYMAP,
  cancel,
  emptyCursor,
  isTypingTarget,
  moveCursor,
  reconcileSelection,
  resolveWorkbenchAction,
  selectionLabel,
  toggleSelection,
} from "./keymap";

describe("the keyboard map is the specification", () => {
  const cases: [string, Parameters<typeof resolveWorkbenchAction>[0], string | null][ ] = [
    ["ArrowUp", { key: "ArrowUp" }, "move-up"],
    ["ArrowDown", { key: "ArrowDown" }, "move-down"],
    ["k", { key: "k" }, "move-up"],
    ["j", { key: "j" }, "move-down"],
    ["Space", { key: " " }, "select"],
    ["Enter", { key: "Enter" }, "activate"],
    ["slash", { key: "/" }, "focus-filter"],
    ["Escape", { key: "Escape" }, "cancel"],
    ["cmd+K", { key: "k", metaKey: true }, "search"],
    ["ctrl+K", { key: "k", ctrlKey: true }, "search"],
  ];

  for (const [name, event, expected] of cases) {
    it(`${name} → ${expected}`, () => {
      assert.equal(resolveWorkbenchAction(event), expected);
    });
  }

  it("covers every action in the printable legend", () => {
    const resolved = new Set(
      cases.map(([, event]) => resolveWorkbenchAction(event)).filter(Boolean),
    );
    for (const entry of WORKBENCH_KEYMAP) {
      assert.ok(resolved.has(entry.action), `${entry.action} has no binding under test`);
    }
  });

  it("leaves unclaimed keys alone", () => {
    assert.equal(resolveWorkbenchAction({ key: "a" }), null);
    assert.equal(resolveWorkbenchAction({ key: "Tab" }), null);
  });

  it("does not steal modified keystrokes it has not claimed", () => {
    assert.equal(resolveWorkbenchAction({ key: "j", metaKey: true }), null);
    assert.equal(resolveWorkbenchAction({ key: "ArrowDown", altKey: true }), null);
  });

  it("leaves shift+j alone so range gestures stay available", () => {
    assert.equal(resolveWorkbenchAction({ key: "j", shiftKey: true }), null);
  });
});

describe("typing wins over the map", () => {
  it("a j typed into a filter stays a j", () => {
    assert.equal(resolveWorkbenchAction({ key: "j" }, { typing: true }), null);
    assert.equal(resolveWorkbenchAction({ key: "/" }, { typing: true }), null);
    assert.equal(resolveWorkbenchAction({ key: " " }, { typing: true }), null);
  });

  it("but Escape always escapes, and cmd+K always searches", () => {
    assert.equal(resolveWorkbenchAction({ key: "Escape" }, { typing: true }), "cancel");
    assert.equal(
      resolveWorkbenchAction({ key: "k", metaKey: true }, { typing: true }),
      "search",
    );
  });

  it("recognises fields that own their keystrokes", () => {
    assert.equal(isTypingTarget({ tagName: "INPUT" } as unknown as EventTarget), true);
    assert.equal(isTypingTarget({ tagName: "TEXTAREA" } as unknown as EventTarget), true);
    assert.equal(isTypingTarget({ tagName: "SELECT" } as unknown as EventTarget), true);
    assert.equal(
      isTypingTarget({ tagName: "DIV", isContentEditable: true } as unknown as EventTarget),
      true,
    );
    assert.equal(isTypingTarget({ tagName: "DIV" } as unknown as EventTarget), false);
    assert.equal(isTypingTarget(null), false);
  });
});

describe("cursor movement", () => {
  it("clamps rather than wrapping at both ends", () => {
    let c = { active: 0, selected: new Set<string>() };
    assert.equal(moveCursor(c, -1, 5).active, 0);
    c = { active: 4, selected: new Set() };
    assert.equal(moveCursor(c, 1, 5).active, 4);
  });

  it("enters from the top on a down move and the bottom on an up move", () => {
    assert.equal(moveCursor(emptyCursor(), 1, 5).active, 0);
    assert.equal(moveCursor(emptyCursor(), -1, 5).active, 4);
  });

  it("has no cursor in an empty grid", () => {
    assert.equal(moveCursor({ active: 2, selected: new Set() }, 1, 0).active, -1);
  });

  it("returns the same object when nothing moved, so React can skip the render", () => {
    const c = { active: 4, selected: new Set<string>() };
    assert.equal(moveCursor(c, 1, 5), c);
  });
});

describe("selection", () => {
  it("toggles a row on and back off", () => {
    let c = toggleSelection(emptyCursor(), "a");
    assert.deepEqual([...c.selected], ["a"]);
    c = toggleSelection(c, "a");
    assert.deepEqual([...c.selected], []);
  });

  it("Esc clears the selection first, then the cursor", () => {
    const withSelection = { active: 2, selected: new Set(["a", "b"]) };
    const once = cancel(withSelection);
    assert.deepEqual([...once.selected], []);
    assert.equal(once.active, 2, "the cursor survives the first Escape");
    assert.equal(cancel(once).active, -1);
  });

  it("drops ids that have gone away, so a refresh cannot strand a selection", () => {
    const c = { active: 3, selected: new Set(["a", "gone"]) };
    const next = reconcileSelection(c, ["a", "b"]);
    assert.deepEqual([...next.selected], ["a"]);
    assert.equal(next.active, 1, "the cursor pulls back into range");
  });

  it("announces the count in words", () => {
    assert.equal(selectionLabel(0), "No rows selected");
    assert.equal(selectionLabel(1), "1 row selected");
    assert.equal(selectionLabel(4), "4 rows selected");
  });
});
