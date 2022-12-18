import 'dotenv/config';

import { GatewayIntentBits } from 'discord.js';

import { Client } from './classes/Client.js';
import { registerCommands } from './core/registerCommands.js';
import { registerEvents } from './core/registerEvents.js';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.logger.info('Loading...');

(await registerCommands()).forEach((command) => {
	client.commands.set(command.name, command);
});

const events = await registerEvents();

for (const event of events) {
	const listeners = event.getListeners();

	if (listeners.on) {
		client.on(event.eventName, async (...args) => {
			try {
				if (listeners.on) {
					await listeners.on(<Client<true>>client, ...args);
				}
			} catch (err) {
				client.logger
					.error(`[Event] ${event.eventName} - on`)
					.error(err);
			}
		});
	}

	if (listeners.once) {
		client.once(event.eventName, async (...args) => {
			try {
				if (listeners.once) {
					await listeners.once(<Client<true>>client, ...args);
				}
			} catch (err) {
				client.logger
					.error(`[Event] ${event.eventName} - once`)
					.error(err);
			}
		});
	}
}

client.logger.info(`[Discord] Connecting...`);

client.login().catch((error) => client.logger.error(error));
