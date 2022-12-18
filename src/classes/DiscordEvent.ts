import type { Client, ClientEvents } from 'discord.js';

export type Listener<K extends keyof ClientEvents> = (
	client: Client<true>,
	...args: ClientEvents[K]
) => any;

export class DiscordEvent<K extends keyof ClientEvents> {
	private _on: Listener<K> | null;
	private _once: Listener<K> | null;

	public constructor(public readonly eventName: K) {
		this._on = null;
		this._once = null;
	}

	public on(fn: Listener<K>) {
		this._on = fn;

		return this;
	}

	public once(fn: Listener<K>) {
		this._once = fn;

		return this;
	}

	public getListeners() {
		return {
			on: this._on,
			once: this._once,
		};
	}
}
