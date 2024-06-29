import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandUserOption
} from "discord.js";
import { Command } from "../../types";
import { generateGuildIcon } from "../../utils";

export default {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("取得伺服器或使用者資訊。")
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("server")
				.setDescription("取得當前伺服器資訊。")
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("user")
				.setDescription("取得使用者資訊。")
				.addUserOption(
					new SlashCommandUserOption()
						.setName("user")
						.setDescription("使用者")
						.setRequired(false)
				)
		),
	async execute(bot, interaction) {
		await interaction.deferReply({ ephemeral: true });

		const subcommand = interaction.options.getSubcommand(true);

		if (subcommand === "server") {
			const guild =
				interaction.guild ?? (await bot.guilds.fetch(interaction.guildId));
			const iconUrl = guild.iconURL();
			const bannerUrl = guild.bannerURL();
			let row;
			const files = [];

			if (iconUrl || bannerUrl) {
				row = new ActionRowBuilder<ButtonBuilder>();
			}
			if (!iconUrl) {
				files.push(
					new AttachmentBuilder(generateGuildIcon(guild.name), {
						name: "icon.png"
					})
				);
			} else {
				row!.addComponents(
					new ButtonBuilder()
						.setLabel("圖示連結")
						.setURL(iconUrl)
						.setStyle(ButtonStyle.Link)
				);
			}
			if (bannerUrl) {
				row!.addComponents(
					new ButtonBuilder()
						.setLabel("橫幅連結")
						.setURL(bannerUrl)
						.setStyle(ButtonStyle.Link)
				);
			}

			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setThumbnail(iconUrl ?? "attachment://icon.png")
						.setImage(bannerUrl)
						.setDescription(`## ${guild.name}`)
						.addFields(
							{
								name: "🪪 ID",
								value: `\`${guild.id}\``,
								inline: true
							},
							{
								name: "👑 擁有者",
								value: `<@${guild.ownerId}>`,
								inline: true
							},
							{
								name: "🕑 建立時間",
								value: `<t:${Math.round(guild.createdTimestamp / 1000)}>`
							},
							{
								name: "👥 成員人數",
								value: `\`${guild.memberCount}\``,
								inline: true
							},
							{
								name: "<:boost:1256521106773381120> 加成狀態",
								value: `等級\`${guild.premiumTier}\`｜\`${guild.premiumSubscriptionCount}\`次加成`,
								inline: true
							}
						)
						.setColor(0x1abc9c)
				],
				components: row && [row],
				files
			});
		} else {
			const user = await (
				interaction.options.getUser("user", false) ?? interaction.user
			).fetch();
			const avatarUrl =
				user.avatarURL({ extension: "png", size: 512 }) ??
				user.defaultAvatarURL;
			const bannerUrl =
				user.bannerURL({ extension: "png", size: 1024 }) ?? null;
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel("頭像連結")
					.setURL(avatarUrl)
					.setStyle(ButtonStyle.Link)
			);

			if (bannerUrl) {
				row.addComponents(
					new ButtonBuilder()
						.setLabel("橫幅連結")
						.setURL(bannerUrl)
						.setStyle(ButtonStyle.Link)
				);
			}

			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setThumbnail(avatarUrl)
						.setImage(bannerUrl)
						.setDescription(
							`## <@${user.id}> \`(${user.bot ? user.tag : `@${user.username}`})\``
						)
						.addFields(
							{
								name: "🪪 ID",
								value: `\`${user.id}\``
							},
							{
								name: "<:discord:1256160302412595272> 加入時間",
								value: `<t:${Math.round(user.createdTimestamp / 1000)}>`
							}
						)
						.setColor(user.accentColor ?? 0x1abc9c)
				],
				components: [row]
			});
		}
	}
} as Command;
