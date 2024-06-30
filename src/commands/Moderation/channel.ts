import {
	EmbedBuilder,
	GuildTextBasedChannel,
	PermissionFlagsBits,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder
} from "discord.js";
import { Command } from "../../types";

export default {
	data: new SlashCommandBuilder()
		.setName("channel")
		.setDescription("簡易頻道管理")
		.addSubcommandGroup(
			new SlashCommandSubcommandGroupBuilder()
				.setName("messages")
				.setDescription("訊息管理")
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName("clear")
						.setDescription("清除所有訊息")
				)
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName("delete")
						.setDescription("清除指定數量的訊息")
						.addIntegerOption(
							new SlashCommandIntegerOption()
								.setName("amount")
								.setDescription("要清除的訊息數")
								.setMinValue(1)
								.setMaxValue(100)
								.setRequired(true)
						)
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("rename")
				.setDescription("重新命名目前的頻道")
				.addStringOption(
					new SlashCommandStringOption()
						.setName("name")
						.setDescription("新的頻道名稱")
						.setMaxLength(100)
						.setRequired(true)
				)
		)
		.addSubcommandGroup(
			new SlashCommandSubcommandGroupBuilder()
				.setName("topic")
				.setDescription("修改目前頻道的主題")
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName("modify")
						.setDescription("為目前的頻道設定新主題")
						.addStringOption(
							new SlashCommandStringOption()
								.setName("new_topic")
								.setDescription("新的頻道主題")
								.setMaxLength(1024)
								.setRequired(true)
						)
				)
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName("remove")
						.setDescription("移除目前頻道的主題")
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("slowmode")
				.setDescription("設定目前頻道的慢速模式")
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName("rate_limit")
						.setDescription("每則訊息間隔秒數")
						.setMinValue(0)
						.setMaxValue(21600)
						.setRequired(true)
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("nsfw")
				.setDescription("開啟或關閉目前頻道的年齡限制")
				.addBooleanOption(
					new SlashCommandBooleanOption()
						.setName("on_off")
						.setDescription("開啟或關閉")
						.setRequired(true)
				)
		)
		.setDefaultMemberPermissions(
			PermissionFlagsBits.ManageChannels |
				PermissionFlagsBits.ManageMessages |
				PermissionFlagsBits.ManageThreads
		),
	async execute(bot, interaction) {
		await interaction.deferReply({ ephemeral: true });

		const subcommand = interaction.options.getSubcommand(true);
		const guild = await bot.guilds.fetch(interaction.guildId);
		const channel = (await guild.channels.fetch(
			interaction.channelId
		)) as GuildTextBasedChannel;
		const me = await guild.members.fetchMe();

		/* 權限檢查 */
		if (subcommand === "clear" || subcommand === "delete") {
			if (!channel.permissionsFor(me).has(PermissionFlagsBits.ManageMessages)) {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription("## 我沒有 `管理訊息` 的權限。")
							.setColor(0xe67e22)
					]
				});
				return;
			}
		} else {
			if (
				channel.isThread() &&
				!channel.permissionsFor(me).has(PermissionFlagsBits.ManageThreads)
			) {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription("## 我沒有 `管理討論串` 的權限。")
							.setColor(0xe67e22)
					]
				});
				return;
			} else if (
				!channel.isThread() &&
				!channel.permissionsFor(me).has(PermissionFlagsBits.ManageChannels)
			) {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription("## 我沒有 `管理頻道` 的權限。")
							.setColor(0xe67e22)
					]
				});
				return;
			}
		}
		/* 執行指令動作 */
		switch (subcommand) {
			case "clear":
				if (channel.isThread()) {
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setDescription(
									`## 無法完全清除討論串訊息。
									> 請使用：\`/channel messages delete\``
								)
								.setColor(0xe67e22)
						]
					});
					break;
				}

				await channel.clone();
				await channel.delete();
				break;
			case "delete":
				const amount = interaction.options.getInteger("amount", true);
				const deleted = await channel.bulkDelete(amount, true);

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`## 成功清除 \`${deleted.size}\` 則訊息。`)
							.setColor(0x1abc9c)
					]
				});
				break;
			case "rename":
				const name = interaction.options.getString("name", true);

				await channel.setName(name);
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`## 已重新命名此頻道。
                > 新名稱：${name}`
							)
							.setColor(0x1abc9c)
					]
				});
				break;
			case "modify":
			case "remove":
				if (channel.isVoiceBased() || channel.isThread()) {
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setDescription("## 此頻道無法設置主題。")
								.setColor(0xe67e22)
						]
					});
					break;
				}

				const topic = interaction.options.getString("new_topic");

				await channel.setTopic(topic);
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`## 已更新此頻道的主題。
              > 新主題：${topic ?? "N/A"}`
							)
							.setColor(0x1abc9c)
					]
				});
				break;
			case "slowmode":
				const rateLimit = interaction.options.getInteger("rate_limit", true);

				await channel.setRateLimitPerUser(rateLimit);
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								!rateLimit
									? "## 已關閉此頻道的慢速模式。"
									: `## 已將此頻道的慢速模式設為 \`${rateLimit}\` 秒。`
							)
							.setColor(0x1abc9c)
					]
				});
				break;
			case "nsfw":
				if (channel.isThread()) {
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setDescription("## 討論串無法設定年齡限制模式。")
								.setColor(0xe67e22)
						]
					});
					break;
				}

				const bool = interaction.options.getBoolean("on_off", true);

				await channel.setNSFW(bool);
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`## 已${bool ? "開啟" : "關閉"}此頻道的年齡限制模式。`
							)
							.setColor(0x1abc9c)
					]
				});
				break;
		}
	}
} as Command;
