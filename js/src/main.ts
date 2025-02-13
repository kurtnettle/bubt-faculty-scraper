import {argv} from 'node:process';
import {program} from './cli/commands.js';

async function main() {
  await program.parseAsync(argv);
}

(async () => {
  await main();
})();
