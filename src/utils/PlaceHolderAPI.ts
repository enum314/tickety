import type { User } from 'discord.js';

export const PlaceHolderAPI = {
	parseUser: (user: User, message: string) =>
		message
			.replace(/{user}/g, user.toString())
			.replace(/{user.tag}/g, user.tag)
			.replace(/{user.id}/g, user.id)
			.replace(/{user.username}/g, user.username)
			.replace(/{user.discriminator}/g, user.discriminator),
};
