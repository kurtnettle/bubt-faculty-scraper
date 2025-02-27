import {Command} from 'commander';
import {handleCommon} from './handlers.js';

const packageInfo = JSON.parse(
  Buffer.from(process.env.NPM_PKG_BASE64, 'base64').toString('utf8'),
);

export const program = new Command();

program
  .name(packageInfo.name)
  .description(packageInfo.description)
  .version(packageInfo.version);

const departmentOptions = (cmd: Command) =>
  cmd
    .option('-D, --list-depts', 'List available departments')
    .option('-d, --dept-alias <alias>', 'Alias of the department to use')
    .option('-a, --all-dept', 'Use all departments')
    .option(
      '-S, --list-snapshots',
      'List available snapshot dates of a department',
    );

departmentOptions(
  program
    .command('extract')
    .description('Extract faculty data')
    .option(
      '-s, --snapshot <date>',
      'Date to use when extracting (YYYY-MM-DD). (default: latest)',
    )
    .option(
      '-o, --output-dir <directory>',
      "Output directory (default: department's snapshot directory)",
    )
    .action(handleCommon),
);

departmentOptions(
  program
    .command('dump')
    .description('Download faculty webpages')
    .action(handleCommon),
);
