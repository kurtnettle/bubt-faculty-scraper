import chalk from 'chalk';
import {scraperConfigs} from '../index.js';

export function printError(message: string) {
  console.error(chalk.red(`error: ${message}`));
}

export function getDepartmentList(): Map<any, any> {
  const depsList = new Map();
  const deps = Array.from(scraperConfigs.keys());

  for (const [index, dept] of deps.entries()) {
    depsList.set(String(index + 1), [
      scraperConfigs.get(dept)?.alias,
      scraperConfigs.get(dept)?.progName,
    ]);
  }

  return depsList;
}

export function validateExtractOptions(options: CommandOptions) {
  // Mutual exclusivity checks
  if (
    options.listDepts &&
    (options.deptAlias ?? options.allDept ?? options.listSnapshots)
  ) {
    return '--list-depts cannot be combined with department selection options';
  }

  if (options.listSnapshots && !options.deptAlias) {
    return '--list-snapshots requires --dept-id';
  }

  if (options.deptAlias && options.allDept) {
    return 'Cannot use both --dept-id and --all-dept';
  }

  if (options.snapshot) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(options.snapshot)) {
      if (!options.deptAlias) {
        return '--snapshots requires --dept-id';
      }
    } else {
      return 'Invalid date format. Use YYYY-MM-DD';
    }
  }

  return undefined;
}
