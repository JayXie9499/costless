import {
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandRoleOption,
	SlashCommandSubcommandBuilder,
	SlashCommandUserOption
} from "discord.js";
import { Command } from "../../types";

export default {
	data: new SlashCommandBuilder()
		.setName("role")
		.setDescription("簡易身分組管理")
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("add")
				.setDescription("給予使用者身分組")
				.addUserOption(
					new SlashCommandUserOption()
						.setName("user")
						.setDescription("目標使用者")
						.setRequired(true)
				)
				.addRoleOption(
					new SlashCommandRoleOption()
						.setName("role")
						.setDescription("要給予的身分組")
						.setRequired(true)
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("remove")
				.setDescription("移除使用者的身分組")
				.addUserOption(
					new SlashCommandUserOption()
						.setName("user")
						.setDescription("目標使用者")
						.setRequired(true)
				)
				.addRoleOption(
					new SlashCommandRoleOption()
						.setName("role")
						.setDescription("要移除的身分組")
						.setRequired(true)
				)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(bot, interaction) {
		await interaction.deferReply({ ephemeral: true });

		const guild = await bot.guilds.fetch(interaction.guildId);
		const me = await guild.members.fetchMe();

		if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription("## 我沒有 `管理身分組` 的權限。")
						.setColor(0xe67e22)
				]
			});
			return;
		}

		const role = interaction.options.getRole("role", true);

		if (role.managed) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription("## 無法給予使用者機器人身分組。")
						.setColor(0xe67e22)
				]
			});
			return;
		}
		if (role.position > me.roles.highest.position) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription(`## 我沒有權限管理 <@&${role.id}> 。`)
						.setColor(0xe67e22)
				]
			});
			return;
		}

		const user = interaction.options.getUser("user", true);
		const member = await guild.members.fetch(user.id);
		const subcommand = interaction.options.getSubcommand(true);

		if (subcommand === "add") {
			if (member.roles.cache.has(role.id)) {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`## <@${user.id}> 已經擁有 <@&${role.id}> 身分組。`
							)
							.setColor(0xe67e22)
					]
				});
				return;
			}

			await member.roles.add(role.id);
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription(`## 成功給予 <@${user.id}> <@&${role.id}> 身分組。`)
						.setColor(0x1abc9c)
				]
			});
		} else {
			if (!member.roles.cache.has(role.id)) {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`## <@${user.id}> 沒有 <@&${role.id}> 身分組。`)
							.setColor(0xe67e22)
					]
				});
				return;
			}

			await member.roles.remove(role.id);
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setDescription(
							`## 已移除 <@${user.id}> 的 <@&${role.id}> 身分組。`
						)
						.setColor(0x1abc9c)
				]
			});
		}
	}
} as Command;
