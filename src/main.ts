import { Command } from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import { version } from '../package.json';
import * as allCommands from './commands';

export default () => {
  const program = new Command();

  Object.keys(allCommands).forEach((key) => (allCommands as Record<string, Function>)[key](program));

  program
    .version(`v${version}`, '-v, --version')
    .description('Command line interfaces for Compass CLI')
    .usage('<command> [option]')
    .on('--help', () => {
      // eslint-disable-next-line no-console
      console.log(`\r\n${figlet.textSync('Compass CLI')}`);
      // 新增说明信息
      // eslint-disable-next-line no-console
      console.log(`\r\nRun ${chalk.cyan(`compass <command> --help`)} show details\r\n`);
    })
    .parse(process.argv);
};
