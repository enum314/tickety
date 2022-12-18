import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
} from 'discord.js';

export async function Paginate(
	ctx: CommandInteraction<'cached'>,
	embeds: EmbedBuilder[],
) {
	let index = 0;

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('previous')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('◀️')
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId('terminate')
			.setStyle(ButtonStyle.Danger)
			.setEmoji('❌')
			.setDisabled(embeds.length === 1),
		new ButtonBuilder()
			.setCustomId('next')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('▶️')
			.setDisabled(embeds.length < 2),
	);

	await ctx.reply({
		embeds: [
			embeds[index].setFooter({
				text: `Page ${index + 1} of ${embeds.length}`,
			}),
		],
		components: [row],
		fetchReply: true,
	});

	if (embeds.length === 1) return;

	const collector = ctx.channel?.createMessageComponentCollector({
		filter: (m) => m.user.id === ctx.user.id,
		time: 60000,
	});

	if (collector) {
		collector.on('collect', async (message) => {
			switch (message.customId) {
				case 'previous':
					index--;
					break;
				case 'next':
					index++;
					break;
				default:
					return collector.stop();
			}

			row.setComponents(
				new ButtonBuilder()
					.setCustomId('previous')
					.setStyle(ButtonStyle.Primary)
					.setEmoji('◀️')
					.setDisabled(index === 0),
				new ButtonBuilder()
					.setCustomId('terminate')
					.setStyle(ButtonStyle.Danger)
					.setEmoji('<:no:974234397454774282>'),
				new ButtonBuilder()
					.setCustomId('next')
					.setStyle(ButtonStyle.Primary)
					.setEmoji('▶️')
					.setDisabled(embeds.length === index + 1),
			);

			await message.update({
				embeds: [
					embeds[index].setFooter({
						text: `Page ${index + 1} of ${embeds.length}`,
					}),
				],
				components: [row],
			});
		});

		collector.on('end', async () => {
			await ctx.editReply({ components: [] });
		});
	}
}
