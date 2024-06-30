import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("檢測機器人延遲"),
	async execute(bot, interaction) {
		const reply = await interaction.deferReply({ fetchReply: true });

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						`## API延遲
					\`${bot.ws.ping}毫秒\`
					## 回覆延遲
					\`${reply.createdTimestamp - interaction.createdTimestamp}毫秒\``
					)
					.setColor(0x1abc9c)
			]
		});
	}
} as Command;
