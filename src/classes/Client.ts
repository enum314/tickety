import { Client as DiscordClient, Collection } from 'discord.js';

import Logger from '../core/Logger.js';
import type { Command } from './Command.js';

export class Client<
	Ready extends boolean = boolean,
> extends DiscordClient<Ready> {
	public readonly commands: Collection<string, Command> = new Collection();
	public readonly logger: typeof Logger = Logger;
}

declare module 'discord.js' {
	export interface Client {
		readonly commands: Collection<string, Command>;
		readonly logger: typeof Logger;
	}
}
