import { ChannelType } from 'discord.js';

import { DiscordEvent } from '../classes/DiscordEvent.js';
import { CheckThrottle, Throttle } from '../core/Throttle.js';
import { server } from '../server.js';

export const event = new DiscordEvent('ready').once((client) => {
	server(client);

	client.logger.info(`[Discord] ${client.user.tag} / ${client.user.id}`);

	client.on('interactionCreate', async (ctx) => {
		if (
			ctx.user.bot ||
			!ctx.isCommand() ||
			!ctx.guild ||
			ctx.channel?.type !== ChannelType.GuildText ||
			!ctx.inCachedGuild()
		) {
			return;
		}

		const command = client.commands.get(ctx.commandName);

		if (!command) {
			await ctx.reply({
				content: `Command not implemented.`,
				ephemeral: true,
			});

			return;
		}

		const timeRemaining = await CheckThrottle(command.name, ctx.user.id);

		if (timeRemaining) {
			await ctx.reply({
				content: `Oops, please wait another **${timeRemaining}** to use that command again :)`,
				ephemeral: true,
			});

			return;
		}

		if (
			command.clientPermissions.length &&
			(!ctx.guild.members.me?.permissions?.has(
				command.clientPermissions,
			) ||
				!ctx.channel
					.permissionsFor(ctx.guild.members.me)
					?.has(command.clientPermissions))
		) {
			await ctx.reply({
				content: `Oops, I need ${command.clientPermissions.join(
					', ',
				)} permission${
					command.clientPermissions.length === 1 ? '' : 's'
				} to execute this command`,
				ephemeral: true,
			});

			await Throttle(command.name, ctx.user.id, 3000);
			return;
		}

		if (
			command.userPermissions.length &&
			!ctx.memberPermissions?.has(command.userPermissions)
		) {
			await ctx.reply({
				content: `Oops, you need ${command.userPermissions.join(
					', ',
				)} permission${
					command.userPermissions.length === 1 ? '' : 's'
				} to execute this command`,
				ephemeral: true,
			});

			await Throttle(command.name, ctx.user.id, 3000);
			return;
		}

		try {
			client.logger.info(
				`[${ctx.user.tag} (${ctx.user.id})]: /${command.name}`,
			);
			await command.run(ctx);
		} catch (err) {
			client.logger.error(`[Command] ${command.name}`).error(err);
		} finally {
			await Throttle(command.name, ctx.user.id, command.cooldown);
		}
	});
});
