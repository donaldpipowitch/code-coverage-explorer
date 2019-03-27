import { resolve } from 'path';
import program from 'commander';
import { check } from './check';
const { version } = require('../package.json');

program
  .version(version)
  .option('-f, --file <path>', 'Path to .json file')
  .option(
    '-t, --threshold <value>',
    'Only report files below a certain threshold',
    parseFloat,
    0.5
  )
  .action(({ file, threshold }) => {
    if (file) {
      showReport({ file, threshold }).catch((err) => {
        console.error(err.toString());
        process.exitCode = 1;
      });
    } else {
      program.help();
    }
  })
  .parse(process.argv);

type ShowReportOptions = {
  file: string;
  threshold: number;
};

async function showReport({ file, threshold }: ShowReportOptions) {
  const data = require(resolve(file));
  const fileReports = await check(data);

  fileReports.forEach((fileReport) => {
    switch (fileReport.type) {
      case 'UNSUPPORTED_FILE':
        console.log(`"${fileReport.url}" is no JS file. Skipped.`);
        break;
      case 'NO_SOURCE_MAP':
        console.log(`"${fileReport.url}" has no source map. Skipped.`);
        break;
      case 'REPORT':
        const { url } = fileReport;
        const thresholdPercent = Math.round(threshold * 100);
        const filtered = fileReport.results.filter(
          ({ coverage }) => coverage < threshold
        );
        if (filtered.length === 0) {
          console.log(
            `"${url}" has no file with less than ${thresholdPercent}% unused code.`
          );
        } else if (filtered.length === 1) {
          console.log(
            `"${url}" one file with less than ${thresholdPercent}% unused code:`
          );
          const percent = Math.round(filtered[0].coverage * 100);
          console.log(`  Unused code in "${filtered[0].source}": ${percent}%`);
        } else {
          const count = filtered.length;
          console.log(
            `"${url}" has ${count} files with less than ${thresholdPercent}% unused code:`
          );
          filtered.forEach((result) => {
            const percent = Math.round(result.coverage * 100);
            console.log(`  Unused code in "${result.source}": ${percent}%`);
          });
        }
        break;
    }
    console.log('');
  });
}
