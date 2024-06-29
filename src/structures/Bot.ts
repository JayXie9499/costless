import {
	Client,
	Collection,
	GatewayIntentBits,
	Options,
	REST,
	Routes
} from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { ClientEventNames, Command, Event } from "../types";
import { Logger } from ".";

export class Bot<Ready extends boolean = boolean> extends Client<Ready> {
	public readonly events = new Collection<ClientEventNames, Event>();
	public readonly commands = new Collection<string, Command>();
	public readonly logger = new Logger();

	constructor() {
		super({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
			makeCache: Options.cacheWithLimits({
				...Options.DefaultMakeCacheSettings,
				GuildMemberManager: {
					maxSize: 75,
					keepOverLimit: (member) => member.id === this.user!.id
				}
			})
		});
	}

	public async init() {
		await Promise.all([this.loadEvents(), this.loadCommands()]);
		await this.deployCommands();
		await this.login(process.env["BOT_TOKEN"]);

		process
			.on("unhandledRejection", (reason) => this.logger.error(reason))
			.on("uncaughtException", this.logger.error);
	}

	private async loadEvents() {
		const eventDir = path.join(process.cwd(), "dist", "events");
		const files = readdirSync(eventDir).filter((file) => file.endsWith(".js"));

		for (const file of files) {
			const event: Event<never> = (await import(path.join(eventDir, file)))
				.default;

			this.on(event.name, event.listener.bind(null, this as Bot<true>));
			this.events.set(event.name, event);
		}

		this.logger.info(`Loaded ${this.events.size} events.`);
	}

	private async loadCommands() {
		const commandDir = path.join(process.cwd(), "dist", "commands");
		const categories = readdirSync(commandDir, { withFileTypes: true })
			.filter((dir) => dir.isDirectory())
			.map((dir) => dir.name);

		for (const category of categories) {
			const files = readdirSync(path.join(commandDir, category)).filter(
				(file) => file.endsWith(".js")
			);

			for (const file of files) {
				const command: Command = (
					await import(path.join(commandDir, category, file))
				).default;

				this.commands.set(command.data.name, command);
			}
		}

		this.logger.info(`Loaded ${this.commands.size} commands.`);
	}

	private async deployCommands() {
		const commands = this.commands.mapValues((cmd) =>
			cmd.data.setDMPermission(false).toJSON()
		);
		const rest = new REST();

		rest.setToken(process.env["BOT_TOKEN"]!);
		await rest.put(Routes.applicationCommands(process.env["BOT_ID"]!), {
			body: commands
		});
		this.logger.info("Deployed commands.");
	}
}
