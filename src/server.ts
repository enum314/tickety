import type { Client } from 'discord.js';
import express from 'express';

export function server(client: Client<true>) {
	const app = express();

	app.use((req, res, next) => {
		if (req.headers.authorization === process.env.API_KEY) {
			next();
		} else {
			res.status(403).json({ message: 'No' });
		}
	});

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	app.get('/api', (_, res) => {
		res.status(200).json({ message: 'Hello World!' });
	});

	app.use((_, res) => {
		res.status(404).json({ message: 'Not Found' });
	});

	app.listen(3001, () => {
		client.logger.info(`Listening on PORT 3001`);
	});
}
