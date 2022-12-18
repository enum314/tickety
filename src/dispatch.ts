import 'dotenv/config';

import { REST } from '@discordjs/rest';

import Logger from './core/Logger.js';
import { registerCommands } from './core/registerCommands.js';
import { Routes } from 'discord.js';

const token = process.env.DISCORD_TOKEN as string;
const clientId = process.env.DISCORD_CLIENT_ID as string;
const guildId = process.env.DISCORD_GUILD_ID as string;

const commands = await registerCommands();

await new REST()
	.setToken(token)
	.put(Routes.applicationGuildCommands(clientId, guildId), {
		body: commands.map((c) => c.data),
	})
	.then(() => Logger.info(`Synced ${commands.size} commands`));
