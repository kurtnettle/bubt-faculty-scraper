import process from 'node:process';
import winston from 'winston';
import {getScraperConfig} from './scrapping/scraper-config.js';

export const scraperConfigs = getScraperConfig();

const {combine, timestamp, colorize, errors, printf, json} = winston.format;

const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';

const consoleFormat = printf(({level, message, timestamp, stack, alias}) => {
  if (alias) {
    return `${timestamp} [${level}]: [${alias}] ${stack ?? message}`;
  }

  return `${timestamp} [${level}]: ${stack ?? message}`;
});

const consoleTransport = new winston.transports.Console({
  format: combine(
    timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    colorize(),
    errors(),
    consoleFormat,
  ),
  handleExceptions: true,
  handleRejections: true,
});

const fileTransport = new winston.transports.File({
  filename: 'faculty-scrapper.log',
  level: 'debug',
});

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: {service: 'faculty-scrapper'},
  format: combine(timestamp(), errors({stack: true}), json()),
  transports: [consoleTransport, fileTransport],
  exitOnError: false,
});
