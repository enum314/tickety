import { Collection } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

import type { Command } from '../classes/Command.js';
import Logger from './Logger.js';

export async function registerCommands() {
	const filePath = path.join(process.cwd(), 'dist', 'commands');
	const files = await fs.readdir(filePath);

	const collection = new Collection<string, Command>();

	for (const file of files) {
		if ((await fs.lstat(path.join(filePath, file))).isDirectory()) {
			const commands = await fs.readdir(path.join(filePath, file));
			for (const command of commands) {
				if (command.endsWith('.js')) {
					try {
						const cmdPath = `../commands/${file}/${command}`;
						const instance = (await import(cmdPath))
							.command as Command;

						collection.set(instance.name, instance);
					} catch (err) {
						Logger.error(
							`[Command] loading '${file}/${command}'`,
						).error(err);
						process.exit(1);
					}
				}
			}
		} else if (file.endsWith('.js')) {
			try {
				const cmdPath = `../commands/${file}`;
				const instance = (await import(cmdPath)).command as Command;

				collection.set(instance.name, instance);
			} catch (err) {
				Logger.error(`[Command] loading '${file}'`).error(err);
				process.exit(1);
			}
		}
	}

	return collection;
}
