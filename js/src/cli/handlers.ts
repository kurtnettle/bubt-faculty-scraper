import {input} from '@inquirer/prompts';
import {scraperConfigs} from '../index.js';
import {
  extractAllDeptFaculties,
  extractFacultyData,
  getSnapshotDates,
} from '../extractors/utils/index.js';
import {
  dumpAllDeptFaculty,
  extractAndDownloadFaculties,
} from '../scrapping/index.js';
import {validateExtractOptions, printError} from './utils.js';
import {
  displayDepartmentList,
  displaySnapshotDates,
  promptForDepartment,
  promptForSnapshotDate,
} from './common.js';

export async function handleDeptInput(depts: Map<string, string[]>) {
  return input({
    message: 'Enter the department number:',
    validate(input) {
      if (!depts.has(input)) {
        return `Invalid department number "${input}". Please try again.`;
      }

      return true;
    },
  });
}

export async function handleCommon(env: any, command: any) {
  const options: CommandOptions = command.opts();
  const cmdName = command._name;

  const departmentAlias = options.deptAlias;

  const errorMessage = validateExtractOptions(options);
  if (errorMessage) {
    printError(errorMessage);
    return;
  }

  if (options.listDepts) {
    displayDepartmentList();
    return;
  }

  if (options.listSnapshots) {
    await displaySnapshotDates(departmentAlias);
    return;
  }

  if (Object.keys(options).length === 0) {
    options.deptAlias = await promptForDepartment();
  }

  switch (cmdName) {
    case 'extract': {
      await (options.allDept
        ? extractAllDeptFaculties(options.outputDir)
        : handleExtract(options));

      break;
    }

    case 'dump': {
      await (options.allDept ? dumpAllDeptFaculty() : handleDump(options));
      break;
    }

    default: {
      printError(`unknown command ${cmdName}`);
    }
  }
}

export async function handleExtract(options: CommandOptions) {
  let snapshotDate = options.snapshot;
  const departmentAlias = options.deptAlias;

  const deptConfig = scraperConfigs.get(departmentAlias);
  if (!deptConfig) {
    printError(
      `Scrapping config not found for the department ${departmentAlias}.`,
    );
    return;
  }

  if (snapshotDate) {
    const directories = await getSnapshotDates(departmentAlias);
    if (!directories.includes(snapshotDate)) {
      printError(
        'Snapshot not found. Use -S to list available snapshot dates.',
      );
      return;
    }
  } else {
    snapshotDate = await promptForSnapshotDate(departmentAlias);
  }

  if (snapshotDate) {
    await extractFacultyData(
      deptConfig,
      snapshotDate,
      undefined,
      options.outputDir,
    );
  }
}

export async function handleDump(options: CommandOptions) {
  await extractAndDownloadFaculties(scraperConfigs.get(options.deptAlias));
}
