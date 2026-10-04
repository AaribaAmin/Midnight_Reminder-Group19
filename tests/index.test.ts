import { describe, it, expect, vi } from "vitest";
import extensionFactory from "../src/index";
import { preview } from "../src/reminder";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

describe("/bedtime-test command", () => {
  it("registers a command named bedtime-test", () => {
    const registerCommand = vi.fn();
    const pi = { registerCommand } as unknown as ExtensionAPI;
    extensionFactory(pi);
    expect(registerCommand).toHaveBeenCalledWith(
      "bedtime-test",
      expect.any(Object)
    );
  });

  it("calls ctx.ui.notify with the preview message when hasUI is true", async () => {
    const registerCommand = vi.fn();
    const pi = { registerCommand } as unknown as ExtensionAPI;
    extensionFactory(pi);

    const notify = vi.fn();
    const ctx = { hasUI: true, ui: { notify } } as any;
    const cmd = registerCommand.mock.calls[0][1];
    await cmd.handler("", ctx);
    expect(notify).toHaveBeenCalledWith(preview(), "info");
  });

  it("is a no-op when hasUI is false", async () => {
    const registerCommand = vi.fn();
    const pi = { registerCommand } as unknown as ExtensionAPI;
    extensionFactory(pi);

    const notify = vi.fn();
    const ctx = { hasUI: false, ui: { notify } } as any;
    const cmd = registerCommand.mock.calls[0][1];
    await cmd.handler("", ctx);
    expect(notify).not.toHaveBeenCalled();
  });
});