import fs from 'fs/promises';
import path from 'path';

import type { DiscordEvent } from '../classes/DiscordEvent.js';
import Logger from './Logger.js';

export async function registerEvents() {
	const filePath = path.join(process.cwd(), 'dist', 'events');
	const files = await fs.readdir(filePath);

	const collection: DiscordEvent<any>[] = [];

	for (const file of files) {
		if (file.endsWith('.js')) {
			try {
				const cmdPath = `../events/${file}`;
				const instance = (await import(cmdPath))
					.event as DiscordEvent<any>;

				collection.push(instance);
			} catch (err) {
				Logger.error(`[Event] loading '${file}'`).error(err);
				process.exit(1);
			}
		}
	}

	return collection;
}
