import yaml from 'yaml';
import z from 'zod';

import Logger from '../core/Logger.js';
import { existsFile, readFile, writeFile } from './FileSystem.js';
import { merge } from './merge.js';

type ConfigType = 'yml' | 'json';

export class Config<Structure> {
	private type: ConfigType;
	private defaults!: Structure;
	private cache!: Structure;
	private validation!: z.ZodObject<
		any,
		'strip',
		z.ZodTypeAny,
		Structure,
		Structure
	>;

	public constructor(public name: string) {
		this.type = 'yml';
	}

	public getType() {
		return this.type;
	}

	public setType(type: ConfigType) {
		this.type = type;

		return this;
	}

	public setValidation(
		validation: (
			z: typeof import('zod'),
		) => z.ZodObject<any, 'strip', z.ZodTypeAny, Structure, Structure>,
	) {
		this.validation = validation(z);

		return this;
	}

	public setDefaults(data: Structure) {
		this.defaults = data;

		return this;
	}

	public async load() {
		const data = await this._load();

		if (!data) return;

		this.cache = data;
	}

	public async reload() {
		await this.load();
	}

	public read() {
		if (!this.cache) {
			throw new Error(`${this.name} Config.load() was not called.`);
		}

		return this.cache;
	}

	public async edit(partial: Partial<Structure>) {
		const current = this.read();

		const data = merge(merge(this.defaults, current), partial);

		if (this.type === 'json') {
			await writeFile(
				['config', `${this.name}.json`],
				JSON.stringify(data, null, 4),
			);
		} else {
			await writeFile(
				['config', `${this.name}.yml`],
				yaml.stringify(data),
			);
		}

		this.cache = data;
	}

	private async _load() {
		if (await existsFile(['config', `${this.name}.${this.type}`])) {
			try {
				const buffer = await readFile([
					'config',
					`${this.name}.${this.type}`,
				]);

				let data: any;

				if (this.type === 'json') {
					data = JSON.parse(buffer.toString());
				} else {
					data = yaml.parse(buffer.toString());
				}

				const response = this.validation.safeParse(data);

				if (!response.success) {
					throw response.error;
				}

				return response.data;
			} catch (err) {
				Logger.error(
					`[Config (${this.name}.${this.type})] Error loading config file`,
				).error(err);
			}

			return null;
		}

		if (this.type === 'json') {
			await writeFile(
				['config', `${this.name}.json`],
				JSON.stringify(this.defaults, null, 4),
			);
		} else {
			await writeFile(
				['config', `${this.name}.yml`],
				yaml.stringify(this.defaults),
			);
		}

		return this.defaults;
	}
}
