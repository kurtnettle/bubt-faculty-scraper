import * as fs from 'node:fs';
import * as path from 'node:path';
import {cwd} from 'node:process';
import {type Config} from './interface.js';

const configJsonPath = path.join(cwd(), 'config.json');

fs.access(configJsonPath, fs.constants.R_OK, (error) => {
  if (error) {
    throw new Error('config.json not found');
  }
});

const config: Config = JSON.parse(fs.readFileSync(configJsonPath, 'utf8'));

if (!config.rootDir) {
  throw new Error('Missing required field "rootDir" in config.json');
}

export const rootDir = config.rootDir;
export const requestDelayMs = config.requestDelayMs;
