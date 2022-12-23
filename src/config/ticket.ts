import { Config } from '../utils/Config.js';

interface TicketConfig {
	archiveCategory: string;
	apply: {
		category: string;
		manager: string;
	};
	recruit: {
		category: string;
		manager: string;
	};
	support: {
		category: string;
		manager: string;
	};
}

export const ticket = new Config<TicketConfig>('ticket')
	.setType('yml')
	.setDefaults({
		archiveCategory: '',
		apply: {
			category: '',
			manager: '',
		},
		recruit: {
			category: '',
			manager: '',
		},
		support: {
			category: '',
			manager: '',
		},
	})
	.setValidation((z) =>
		z.object({
			archiveCategory: z.string(),
			apply: z.object({ category: z.string(), manager: z.string() }),
			recruit: z.object({ category: z.string(), manager: z.string() }),
			support: z.object({ category: z.string(), manager: z.string() }),
		}),
	);

await ticket.load();
