import { Command } from 'commander';
import { version } from '../package.json';
import * as allCommands from './commands';

export default () => {
  const program = new Command();

  Object.keys(allCommands).forEach((key) => (allCommands as Record<string, Function>)[key](program));

  program
    .version(`v${version}`, '-v, --version')
    .description('Command line interfaces for Compass CLI')
    .usage('<command> [option]')
    .parse(process.argv);
};
