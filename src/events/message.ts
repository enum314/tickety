import { DiscordEvent } from '../classes/DiscordEvent.js';

export const channels = new Map<string, NodeJS.Timeout>();

export const event = new DiscordEvent('messageCreate').on((_, message) => {
	if (message.author.bot) return;

	if (channels.has(message.channel.id)) {
		const timeout = channels.get(message.channel.id);

		clearTimeout(timeout);
	}
});
