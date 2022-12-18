import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const Logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.errors({ stack: true }),
		winston.format.prettyPrint(),
		winston.format.printf(({ level, message, stack }) => {
			return `[${new Date()
				.toLocaleString()
				.toUpperCase()}] [${level.toUpperCase()}]: ${stack ?? message}`;
		}),
	),
	defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.Console(),
		new DailyRotateFile({
			filename: `logs${path.sep}%DATE%.log`,
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d',
			createSymlink: true,
			symlinkName: 'latest.log',
		}),
		new DailyRotateFile({
			level: 'warn',
			filename: `logs${path.sep}errors${path.sep}%DATE%.log`,
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d',
			createSymlink: true,
			symlinkName: 'latest-errors.log',
		}),
	],
});

export default Logger;
