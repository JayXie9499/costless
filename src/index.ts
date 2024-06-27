import dotenv from "dotenv";
import { Bot } from "./structures";
import path from "path";

if (process.env["MODE"] === "prod") {
	dotenv.config({
		path: path.join(process.cwd(), ".env.production")
	});
} else if (process.env["MODE"] === "dev") {
	dotenv.config({
		path: path.join(process.cwd(), ".env.development")
	});
}

const bot = new Bot();

bot.init();
