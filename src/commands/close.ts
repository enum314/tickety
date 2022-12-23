import {
	CategoryChannel,
	ChannelType,
	Collection,
	EmbedBuilder,
	hyperlink,
	Message,
	Role,
} from 'discord.js';
import { create } from 'sourcebin';

import { Command } from '../classes/Command.js';
import { ticket } from '../config/ticket.js';

export const command = new Command('close')
	.set((ctx) =>
		ctx
			.addStringOption((s) =>
				s
					.setName('reason')
					.setDescription('Reason for closing the ticket.')
					.setRequired(true),
			)
			.setDescription('Closes the current ticket.'),
	)
	.dispatch(async (ctx) => {
		const config = ticket.read();

		if (!config.archiveCategory) return;

		await ctx.deferReply({ ephemeral: true });

		const category = ctx.guild.channels.cache.get(
			config.archiveCategory,
		) as CategoryChannel;

		if (!category || category.type !== ChannelType.GuildCategory) return;

		let manager: Role | undefined;

		if (config.apply.category === ctx.channel?.parentId) {
			if (!ctx.member.roles.cache.has(config.apply.manager)) {
				await ctx.editReply({
					content: 'You are not allowed to do that.',
				});
				return;
			}

			manager = ctx.guild.roles.cache.get(config.apply.manager) as Role;
		}

		if (config.recruit.category === ctx.channel?.parentId) {
			if (!ctx.member.roles.cache.has(config.recruit.manager)) {
				await ctx.editReply({
					content: 'You are not allowed to do that.',
				});
				return;
			}

			manager = ctx.guild.roles.cache.get(config.recruit.manager) as Role;
		}

		if (config.support.category === ctx.channel?.parentId) {
			if (!ctx.member.roles.cache.has(config.support.manager)) {
				await ctx.editReply({
					content: 'You are not allowed to do that.',
				});
				return;
			}

			manager = ctx.guild.roles.cache.get(config.support.manager) as Role;
		}

		if (
			[
				config.apply.category,
				config.recruit.category,
				config.support.category,
			].includes(ctx.channel?.parentId ?? '') &&
			manager
		) {
			const reason = ctx.options.getString('reason', true);

			const messages =
				(await ctx.channel?.messages.fetch()) as Collection<
					string,
					Message<true>
				>;

			const content = messages
				.reverse()
				.filter((m) => !m.author.bot)
				.map(
					(m) =>
						`[${new Date(m.createdAt).toLocaleString('en-US')}] ${
							m.author.tag
						}: ${
							m.attachments.size > 0
								? m.attachments
										.map((attachment) => attachment.url)
										.join(' ')
								: m.content
						}`,
				)
				.join('\n');

			const bin = await create({
				title: `Ticket Transcript ${ctx.channelId}`,
				description: 'Transcript',
				files: [
					{
						content: `Transcript:\n${content}`,
						language: 'text',
					},
				],
			});

			await ctx.channel?.send({
				embeds: [
					new EmbedBuilder()
						.setTitle('Ticket Closed')
						.setDescription(`**Reason**:\n${reason}`)
						.addFields([
							{
								name: 'Transcript',
								value: hyperlink(bin.shortUrl, bin.url),
							},
						]),
				],
			});

			await ctx.channel?.edit({
				parent: category,
				permissionOverwrites: [
					{
						id: ctx.guildId,
						deny: ['ViewChannel'],
					},
					{
						id: ctx.user,
						allow: [
							'ViewChannel',
							'AttachFiles',
							'EmbedLinks',
							'ReadMessageHistory',
						],
						deny: ['SendMessages'],
					},
					{
						id: ctx.client.user,
						allow: [
							'ViewChannel',
							'SendMessages',
							'ManageChannels',
							'ReadMessageHistory',
						],
					},
					{
						id: manager,
						allow: [
							'ViewChannel',
							'SendMessages',
							'ManageChannels',
							'ReadMessageHistory',
						],
					},
				],
			});

			await ctx.editReply({
				content: 'This ticket has been closed and archived',
			});
		} else {
			await ctx.editReply({ content: 'This is not a ticket channel.' });
		}
	});
