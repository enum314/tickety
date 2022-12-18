import ms from 'ms';

import { prisma } from '../database/prisma.js';

export function generateKey(command: string, userId: string) {
	return `${command}|${userId}`;
}

export async function CheckThrottle(command: string, userId: string) {
	const key = generateKey(command, userId);

	const throttle = await prisma.cooldown.findUnique({ where: { id: key } });

	if (throttle) {
		const now = Date.now();
		const { expiration } = throttle;

		if (expiration > now) {
			return ms(Number(expiration) - now);
		}

		await prisma.cooldown.delete({ where: { id: key } });
	}

	return false;
}

export async function Throttle(
	command: string,
	userId: string,
	duration: number,
) {
	const key = generateKey(command, userId);

	await prisma.cooldown.create({
		data: { id: key, expiration: Date.now() + duration },
	});
}
