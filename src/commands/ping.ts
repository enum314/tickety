import { Command } from '../classes/Command.js';
import { Config } from '../utils/Config.js';

const ping = new Config<{ message: string }>('ping')
	.setType('yml')
	.setDefaults({ message: 'Pong!' })
	.setValidation((z) => z.object({ message: z.string() }));

await ping.load();

export const command = new Command('ping')
	.set((ctx) => ctx.setDescription('Replies with pong!'))
	.dispatch(async (ctx) => {
		await ctx.reply(ping.read().message);
	});
