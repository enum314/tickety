import {
	ActionRowBuilder,
	CategoryChannel,
	channelMention,
	ChannelType,
	EmbedBuilder,
	Events,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	userMention,
} from 'discord.js';

import { DiscordEvent } from '../classes/DiscordEvent.js';
import { ticket } from '../config/ticket.js';
import { channels } from './message.js';

export const event = new DiscordEvent(Events.InteractionCreate).on(
	async (client, interaction) => {
		if (!interaction.guildId) return;

		if (interaction.isButton()) {
			switch (interaction.customId) {
				case 'apply': {
					await interaction.showModal(
						new ModalBuilder()
							.setCustomId('apply')
							.setTitle('Application Form')
							.addComponents(
								new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
									new TextInputBuilder()
										.setCustomId('role')
										.setLabel('What are you applying for?')
										.setStyle(TextInputStyle.Short)
										.setPlaceholder(
											'Web Developer, Bot Developer, etc.',
										)
										.setRequired(true),
								),
								new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
									new TextInputBuilder()
										.setCustomId('reason')
										.setLabel('Why do you want to apply?')
										.setPlaceholder(
											'Reason for applying...',
										)
										.setStyle(TextInputStyle.Paragraph)
										.setRequired(true),
								),
							),
					);
					break;
				}
				case 'recruit': {
					await interaction.showModal(
						new ModalBuilder()
							.setCustomId('recruit')
							.setTitle('Recruitment Form')
							.addComponents(
								new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
									new TextInputBuilder()
										.setCustomId('role')
										.setLabel('What are you looking for?')
										.setStyle(TextInputStyle.Short)
										.setPlaceholder(
											'Bot Developer, Web Developer, etc.',
										)
										.setRequired(true),
								),
								new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
									new TextInputBuilder()
										.setCustomId('reason')
										.setLabel('Why are you recruiting?')
										.setPlaceholder(
											'Reason for recruiting...',
										)
										.setStyle(TextInputStyle.Paragraph)
										.setRequired(true),
								),
							),
					);
					break;
				}
				case 'support': {
					await interaction.showModal(
						new ModalBuilder()
							.setCustomId('support')
							.setTitle('Ask for Support')
							.addComponents(
								new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
									new TextInputBuilder()
										.setCustomId('topic')
										.setLabel('What help do you need?')
										.setStyle(TextInputStyle.Paragraph)
										.setRequired(true),
								),
							),
					);
					break;
				}
			}
		}

		if (interaction.isModalSubmit()) {
			switch (interaction.customId) {
				case 'apply': {
					const { apply, archiveCategory } = ticket.read();

					const category = interaction.guild?.channels.cache.get(
						apply.category,
					) as CategoryChannel;
					const manager = interaction.guild?.roles.cache.get(
						apply.manager,
					);
					const archive = interaction.guild?.channels.cache.get(
						archiveCategory,
					) as CategoryChannel;

					if (
						!category ||
						!manager ||
						!archive ||
						category.type !== ChannelType.GuildCategory ||
						archive.type !== ChannelType.GuildCategory
					) {
						return;
					}

					const exists = !!category.children.cache.find(
						(channel) => channel.name === interaction.user.id,
					);

					if (exists) {
						await interaction.reply({
							ephemeral: true,
							content: 'You already have an application ticket.',
						});

						return;
					}

					const role = interaction.fields.getTextInputValue('role');
					const reason =
						interaction.fields.getTextInputValue('reason');

					await interaction.deferReply({ ephemeral: true });

					const channel = await category.children.create({
						type: ChannelType.GuildText,
						name: interaction.user.id,
						permissionOverwrites: [
							{
								id: interaction.guildId,
								deny: ['ViewChannel'],
							},
							{
								id: interaction.user,
								allow: [
									'ViewChannel',
									'SendMessages',
									'AttachFiles',
									'EmbedLinks',
									'ReadMessageHistory',
								],
							},
							{
								id: client.user,
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

					await channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('Application')
								.setColor('Blue')
								.setTimestamp()
								.setDescription(
									`**What are you applying for?**\n${role}\n\n**Why do you want to apply?**\n${reason}`,
								),
						],
					});

					channels.set(
						channel.id,
						setTimeout(async () => {
							await channel.send({
								embeds: [
									new EmbedBuilder()
										.setTitle('Ticket Auto Closed')
										.setDescription(
											`**Reason**:\nNo activity within 3 minutes of creating this ticket.`,
										)
										.addFields([
											{
												name: 'Transcript',
												value: 'No transcript.',
											},
										]),
								],
							});

							channel.edit({
								parent: archive,
								permissionOverwrites: [
									{
										id: interaction.guildId as string,
										deny: ['ViewChannel'],
									},
									{
										id: interaction.user,
										allow: [
											'ViewChannel',
											'AttachFiles',
											'EmbedLinks',
											'ReadMessageHistory',
										],
										deny: ['SendMessages'],
									},
									{
										id: client.user,
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
						}, 60000 * 3),
					);

					await interaction.editReply({
						content: `${userMention(
							interaction.user.id,
						)} Your application has been submitted. Please proceed to ${channelMention(
							channel.id,
						)}`,
					});

					break;
				}
				case 'recruit': {
					const { recruit, archiveCategory } = ticket.read();

					const category = interaction.guild?.channels.cache.get(
						recruit.category,
					) as CategoryChannel;
					const manager = interaction.guild?.roles.cache.get(
						recruit.manager,
					);
					const archive = interaction.guild?.channels.cache.get(
						archiveCategory,
					) as CategoryChannel;

					if (
						!category ||
						!manager ||
						!archive ||
						category.type !== ChannelType.GuildCategory ||
						archive.type !== ChannelType.GuildCategory
					) {
						return;
					}

					const exists = !!category.children.cache.find(
						(channel) => channel.name === interaction.user.id,
					);

					if (exists) {
						await interaction.reply({
							ephemeral: true,
							content: 'You already have a recruitment ticket.',
						});

						return;
					}

					const role = interaction.fields.getTextInputValue('role');
					const reason =
						interaction.fields.getTextInputValue('reason');

					await interaction.deferReply({ ephemeral: true });

					const channel = await category.children.create({
						type: ChannelType.GuildText,
						name: interaction.user.id,
						permissionOverwrites: [
							{
								id: interaction.guildId,
								deny: ['ViewChannel'],
							},
							{
								id: interaction.user,
								allow: [
									'ViewChannel',
									'SendMessages',
									'AttachFiles',
									'EmbedLinks',
									'ReadMessageHistory',
								],
							},
							{
								id: client.user,
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

					await channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('Recruitment')
								.setColor('Yellow')
								.setTimestamp()
								.setDescription(
									`**What are you looking for?**\n${role}\n\n**Why are you recruiting?**\n${reason}`,
								),
						],
					});

					channels.set(
						channel.id,
						setTimeout(async () => {
							await channel.send({
								embeds: [
									new EmbedBuilder()
										.setTitle('Ticket Auto Closed')
										.setDescription(
											`**Reason**:\nNo activity within 3 minutes of creating this ticket.`,
										)
										.addFields([
											{
												name: 'Transcript',
												value: 'No transcript.',
											},
										]),
								],
							});

							channel.edit({
								parent: archive,
								permissionOverwrites: [
									{
										id: interaction.guildId as string,
										deny: ['ViewChannel'],
									},
									{
										id: interaction.user,
										allow: [
											'ViewChannel',
											'AttachFiles',
											'EmbedLinks',
											'ReadMessageHistory',
										],
										deny: ['SendMessages'],
									},
									{
										id: client.user,
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
						}, 60000 * 3),
					);

					await interaction.editReply({
						content: `${userMention(
							interaction.user.id,
						)} Your recruitment form has been submitted. Please proceed to ${channelMention(
							channel.id,
						)}`,
					});

					break;
				}
				case 'support': {
					const { support, archiveCategory } = ticket.read();

					const category = interaction.guild?.channels.cache.get(
						support.category,
					) as CategoryChannel;
					const manager = interaction.guild?.roles.cache.get(
						support.manager,
					);
					const archive = interaction.guild?.channels.cache.get(
						archiveCategory,
					) as CategoryChannel;

					if (
						!category ||
						!manager ||
						!archive ||
						category.type !== ChannelType.GuildCategory ||
						archive.type !== ChannelType.GuildCategory
					) {
						return;
					}

					const exists = !!category.children.cache.find(
						(channel) => channel.name === interaction.user.id,
					);

					if (exists) {
						await interaction.reply({
							ephemeral: true,
							content: 'You already have a recruitment ticket.',
						});

						return;
					}

					const topic = interaction.fields.getTextInputValue('topic');

					await interaction.deferReply({ ephemeral: true });

					const channel = await category.children.create({
						type: ChannelType.GuildText,
						name: interaction.user.id,
						permissionOverwrites: [
							{
								id: interaction.guildId,
								deny: ['ViewChannel'],
							},
							{
								id: interaction.user,
								allow: [
									'ViewChannel',
									'SendMessages',
									'AttachFiles',
									'EmbedLinks',
									'ReadMessageHistory',
								],
							},
							{
								id: client.user,
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

					await channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('Asking for Support')
								.setColor('Red')
								.setTimestamp()
								.setDescription(
									`**What help do you need?**\n${topic}`,
								),
						],
					});

					channels.set(
						channel.id,
						setTimeout(async () => {
							await channel.send({
								embeds: [
									new EmbedBuilder()
										.setTitle('Ticket Auto Closed')
										.setDescription(
											`**Reason**:\nNo activity within 3 minutes of creating this ticket.`,
										)
										.addFields([
											{
												name: 'Transcript',
												value: 'No transcript.',
											},
										]),
								],
							});

							channel.edit({
								parent: archive,
								permissionOverwrites: [
									{
										id: interaction.guildId as string,
										deny: ['ViewChannel'],
									},
									{
										id: interaction.user,
										allow: [
											'ViewChannel',
											'AttachFiles',
											'EmbedLinks',
											'ReadMessageHistory',
										],
										deny: ['SendMessages'],
									},
									{
										id: client.user,
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
						}, 60000 * 3),
					);

					await interaction.editReply({
						content: `${userMention(
							interaction.user.id,
						)} Your support ticket has been created. Please proceed to ${channelMention(
							channel.id,
						)}`,
					});

					break;
				}
			}
		}
	},
);
