import fs from 'fs/promises';
import path from 'path';

function createPath(paths: string[]) {
	return path.join(process.cwd(), ...paths);
}

export async function writeFile(
	paths: string[],
	buffer: string | NodeJS.ArrayBufferView,
) {
	await fs.writeFile(createPath(paths), buffer);
}

export function readFile(paths: string[]) {
	return fs.readFile(createPath(paths));
}

export async function existsFile(paths: string[]) {
	try {
		return (await stat(paths)).isFile();
	} catch (err) {
		return false;
	}
}

export function stat(paths: string[]) {
	return fs.stat(createPath(paths));
}

export function readdir(paths: string[]) {
	return fs.readdir(createPath(paths));
}

export async function mkdir(paths: string[]) {
	await fs.mkdir(createPath(paths));
}

export async function existsDirectory(paths: string[]) {
	try {
		return (await stat(paths)).isDirectory();
	} catch (err) {
		return false;
	}
}
