import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { preview, type Clock, type Timer } from "./reminder";

export interface ExtensionDeps {
	clock?: Clock;
	timer?: Timer;
}

export default function (pi: ExtensionAPI, _deps?: ExtensionDeps) {
	pi.registerCommand("bedtime-test", {
		description: "Preview the midnight reminder message",
		handler: async (_args, ctx) => {
			if (ctx.hasUI) {
				ctx.ui.notify(preview(), "info");
			}
		},
	});
}
