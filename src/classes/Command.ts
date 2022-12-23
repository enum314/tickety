import {
	ChatInputCommandInteraction,
	PermissionsString,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import ms from 'ms';

export class Command {
	public data!: any;

	private _cooldown!: string;
	private _category!: string;
	private _clientPermissions!: PermissionsString[];
	private _userPermissions!: PermissionsString[];

	private _run!: (
		ctx: ChatInputCommandInteraction<'cached'>,
	) => Promise<any> | any;

	public constructor(private _name: string) {}

	public set(
		fn: (
			builder: SlashCommandBuilder,
		) =>
			| SlashCommandBuilder
			| SlashCommandSubcommandBuilder
			| SlashCommandOptionsOnlyBuilder
			| SlashCommandSubcommandGroupBuilder
			| SlashCommandSubcommandsOnlyBuilder,
	) {
		const out = fn(new SlashCommandBuilder().setName(this._name));
		this.data = out.toJSON();

		return this;
	}

	public get name() {
		return this._name;
	}

	public get description() {
		return this.data.description;
	}

	public get cooldown() {
		return this._cooldown ? ms(this._cooldown) : 3000;
	}

	public setCooldown(cd: string) {
		this._cooldown = cd;

		return this;
	}

	public get category() {
		return this._category ?? 'default';
	}

	public setCategory(category: string) {
		this._category = category;

		return this;
	}

	public get clientPermissions() {
		return this._clientPermissions ?? [];
	}

	public setClientPermissions(permissions: PermissionsString[]) {
		this._clientPermissions = permissions;

		return this;
	}

	public get userPermissions() {
		return this._userPermissions ?? [];
	}

	public setUserPermissions(permissions: PermissionsString[]) {
		this._userPermissions = permissions;

		return this;
	}

	public get run() {
		return this._run;
	}

	public dispatch(
		fn: (ctx: ChatInputCommandInteraction<'cached'>) => Promise<any> | any,
	) {
		this._run = fn;

		return this;
	}
}
