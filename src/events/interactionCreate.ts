import { Event } from "../types";

export default {
	name: "interactionCreate",
	listener(bot, interaction) {
		if (!interaction.inGuild() || !interaction.isChatInputCommand()) {
			return;
		}

		const commandName = interaction.commandName;
		const command = bot.commands.get(commandName);

		if (!command) {
			return;
		}

		command.execute(bot, interaction);
		bot.logger.info(`@${interaction.user.username} executed /${commandName}`);
	}
} as Event<"interactionCreate">;
