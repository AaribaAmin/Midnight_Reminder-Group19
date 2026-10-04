import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { preview, Reminder, type Clock, type Timer } from "./reminder";

export interface ExtensionDeps {
	clock?: Clock;
	timer?: Timer;
}

export default function (pi: ExtensionAPI, deps?: ExtensionDeps) {
	const clock: Clock = deps?.clock ?? { now: () => new Date() };
	const timer: Timer = deps?.timer ?? {
		setInterval: (cb, ms) => setInterval(cb, ms),
		clearInterval: (id) => clearInterval(id),
	};

	let reminder: Reminder | undefined;

	pi.registerCommand("bedtime-test", {
		description: "Preview the midnight reminder message",
		handler: async (_args, ctx) => {
			if (ctx.hasUI) {
				ctx.ui.notify(preview(), "info");
			}
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		reminder?.stop();
		reminder = new Reminder(clock, timer, {
			notify: (msg) => ctx.ui.notify(msg, "info"),
		});
		reminder.start();
	});

	pi.on("session_shutdown", async () => {
		reminder?.stop();
		reminder = undefined;
	});
}
