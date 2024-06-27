import { Event } from "../types";

export default {
	name: "ready",
	listener(bot) {
		bot.logger.info(`${bot.user.tag} is ready.`);
	}
} as Event<"ready">;
