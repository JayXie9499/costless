import {
	ChatInputCommandInteraction,
	ClientEvents,
	SlashCommandBuilder
} from "discord.js";
import { Bot } from "./structures";

/* Enums */
export enum LogLevel {
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
	DEBUG = "debug"
}

/* Interfaces */
export interface Event<Name extends ClientEventNames = ClientEventNames> {
	name: Name;
	listener(bot: Bot<true>, ...args: ClientEvents[Name]): void;
}

export interface Command {
	data: SlashCommandBuilder;
	execute(
		bot: Bot<true>,
		interaction: ChatInputCommandInteraction<"cached" | "raw">
	): Promise<void>;
}

/* Types */
export type ClientEventNames = keyof ClientEvents;
