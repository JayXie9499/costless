import { Event } from "../types";

export default {
	name: "error",
	listener(bot, error) {
		bot.logger.error(error);
	}
} as Event<"error">;
