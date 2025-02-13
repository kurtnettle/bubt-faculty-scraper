import chalk from 'chalk';
import {select} from '@inquirer/prompts';
import {scraperConfigs} from '../index.js';
import {getSnapshotDates} from '../extractors/utils/index.js';
import {printError} from './utils.js';

export function displayDepartmentList() {
  console.log(chalk.cyan('---- Available Departments ----\n'));
  Array.from(scraperConfigs.values()).map((config, index) => {
    console.log(
      `${chalk.cyan(String(index + 1).padStart(2))}. ${config.progName}`,
    );
  });
}

export async function promptForDepartment() {
  const choices = [];
  for (const [index, config] of scraperConfigs.entries()) {
    choices.push({
      name: config.progName,
      value: config.alias,
      description: `Alias: ${chalk.yellow(config.alias)}`,
    });
  }

  return select({
    message: 'Select the department',
    choices,
    pageSize: scraperConfigs.size,
  });
}

export async function displaySnapshotDates(departmentAlias: string) {
  const directories = await getSnapshotDates(departmentAlias);
  if (directories.length === 0) {
    console.log(
      chalk.red(
        `No snapshots available for department: ${departmentAlias} Did you forget to dump faculty webpages?`,
      ),
    );
    return;
  }

  console.log(
    chalk.cyan(
      `--- Available Snapshots for ${chalk.bold(departmentAlias)} ---\n`,
    ),
  );

  for (const [index, date] of directories.entries()) {
    console.log(`${chalk.cyan(String(index + 1).padStart(2))}. ${date}`);
  }
}

export async function promptForSnapshotDate(deptAlias: string) {
  if (!scraperConfigs.has(deptAlias)) {
    printError(`Invalid department alias '${deptAlias}'`);
    return;
  }

  const directories = await getSnapshotDates(deptAlias);
  if (directories.length === 0) {
    printError(
      'No snapshot directories were found. Did you forget to run dump command?\n',
    );
    return;
  }

  const choices = directories.map((dir, index) => ({
    name: `${dir} ${index === 0 ? '(latest)' : ''}`,
    value: dir,
  }));

  return select({
    message: 'Select the snapshot to use',
    choices,
    pageSize: scraperConfigs.size,
  });
}
