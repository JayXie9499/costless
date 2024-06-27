import { existsSync, mkdirSync, renameSync, statSync, writeFileSync } from "fs";
import path from "path";
import util from "util";
import { LogLevel } from "../types";

export class Logger {
	constructor() {
		const logDir = path.join(process.cwd(), "logs");

		if (!existsSync(logDir)) {
			mkdirSync(logDir);
		}
		if (existsSync(path.join(logDir, "latest.log"))) {
			const logFile = path.join(logDir, "latest.log");
			const fileDate = this.getUTCTime(statSync(logFile).mtimeMs);

			renameSync(
				logFile,
				path.join(logDir, `${Object.values(fileDate).join("")}.log`)
			);
		}
	}

	public info(...messages: unknown[]) {
		this.writeLog(LogLevel.INFO, messages);
	}

	public warn(...messages: unknown[]) {
		this.writeLog(LogLevel.WARN, messages);
	}

	public error(...messages: unknown[]) {
		this.writeLog(LogLevel.ERROR, messages);
	}

	public debug(...messages: unknown[]) {
		this.writeLog(LogLevel.DEBUG, messages);
	}

	private writeLog(level: LogLevel, ...messages: unknown[]) {
		const time = this.getUTCTime();
		let content =
			`[${time.year}/${time.month}/${time.date}-${time.hours}:${time.minutes}:${time.seconds}]`.padEnd(
				23
			) + `[${level.toUpperCase()}]`.padEnd(8);

		for (const msg of messages) {
			if (content !== "") {
				content += " ";
			}
			if (typeof msg === "object") {
				content += util.inspect(msg);
			} else {
				content += msg;
			}
		}

		console.log(content);
		writeFileSync(
			path.join(process.cwd(), "logs", "latest.log"),
			`${content}\n`,
			{ flag: "a+" }
		);
	}

	private getUTCTime(timestamp?: number) {
		if (typeof timestamp !== "number") {
			timestamp = Date.now();
		}

		const tz = process.env["TZ"] ? parseInt(process.env["TZ"]) : 0;
		const date = new Date(timestamp + tz * 36e5);

		return {
			year: `${date.getUTCFullYear()}`,
			month: this.formatInt(date.getUTCMonth() + 1),
			date: this.formatInt(date.getUTCDate()),
			hours: this.formatInt(date.getUTCHours()),
			minutes: this.formatInt(date.getUTCMinutes()),
			seconds: this.formatInt(date.getUTCSeconds())
		};
	}

	private formatInt(num: number) {
		if (num < 10) {
			return `0${num}`;
		}

		return `${num}`;
	}
}
