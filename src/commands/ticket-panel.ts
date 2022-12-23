import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../classes/Command.js';

export const command = new Command('ticket-panel')
	.set((ctx) =>
		ctx
			.addChannelOption((c) =>
				c.setName('channel').setDescription('F').setRequired(true),
			)
			.setDescription(
				'Send the panel of the ticket for a specific channel',
			),
	)
	.dispatch(async (ctx) => {
		const channel = ctx.options.getChannel('channel', true);

		if (channel.type !== ChannelType.GuildText) {
			ctx.reply({
				ephemeral: true,
				content: 'That is not a valid text channel',
			});

			return;
		}

		await ctx.reply({ ephemeral: true, content: 'Sent!' });

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('apply')
				.setLabel('Apply')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('recruit')
				.setLabel('Recruit')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('support')
				.setLabel('Support')
				.setStyle(ButtonStyle.Primary),
		);

		await channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor('Aqua')
					.setTitle('Create a new ticket!')
					.setDescription(
						'By clicking the buttons, a ticket will be created for you.',
					),
			],
			components: [row],
		});
	});
