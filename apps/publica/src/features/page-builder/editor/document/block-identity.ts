import type { Component, Editor } from "grapesjs";

const inlineTags = new Set(["b", "strong", "i", "em", "u", "s", "strike", "del", "br", "span"]);

export function createPageId(prefix: "block" | "page") {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `${prefix}-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function registerPageBlockIdentity(editor: Editor) {
  function assign(component: Component, clone: boolean) {
    const tag = component.get("tagName");
    if (["wrapper", "head", "textnode"].includes(component.get("type") ?? "")
      || tag === "html" || (tag && inlineTags.has(tag))) return;
    if (clone || component.get("pageBlockId") === undefined) {
      component.set("pageBlockId", createPageId("block"), { silent: true });
    }
  }

  editor.on("component:create", (component) => assign(component, false));
  // Core 0.23.9 emits this for every clone, including recursively cloned children.
  editor.on("component:clone", (component) => assign(component, true));
}
