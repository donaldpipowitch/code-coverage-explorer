import {
  SourceMapConsumer,
  BasicSourceMapConsumer,
  IndexedSourceMapConsumer
} from 'source-map';
import { fromSource } from 'convert-source-map';
const stringPos = require('string-pos');

export type CoverageRange = {
  start: number;
  end: number;
};

export type FileCoverage = {
  url: string;
  ranges: CoverageRange[];
  text: string;
};

export type SourceReport = { source: string; coverage: number };

export type UnsupportedFileReport = { type: 'UNSUPPORTED_FILE'; url: string };
export type NoSourceMapFileReport = { type: 'NO_SOURCE_MAP'; url: string };
export type RegularFileReport = {
  type: 'REPORT';
  url: string;
  results: SourceReport[];
};

export type FileReport =
  | UnsupportedFileReport
  | NoSourceMapFileReport
  | RegularFileReport;

export function check(files: FileCoverage[]): Promise<FileReport[]> {
  return Promise.all(
    files.map(async (file) => {
      if (!file.url.endsWith('.js')) {
        return {
          type: 'UNSUPPORTED_FILE',
          url: file.url
        } as UnsupportedFileReport;
      }

      const sourceMap = fromSource(file.text);
      if (!sourceMap) {
        return {
          type: 'NO_SOURCE_MAP',
          url: file.url
        } as NoSourceMapFileReport;
      }

      const results = await SourceMapConsumer.with(
        sourceMap.toObject(),
        null,
        (consumer) => {
          return consumer.sources
            .map((source) => {
              const coverage = calculateUnusedCode(consumer, source, file);
              return { coverage, source };
            })
            .filter(({ coverage }) => !isNaN(coverage)) // TODO: Check, why this can be NaN.
            .sort((a, b) => a.coverage - b.coverage);
        }
      );
      return { type: 'REPORT', url: file.url, results } as RegularFileReport;
    })
  );
}

function calculateUnusedCode(
  consumer: BasicSourceMapConsumer | IndexedSourceMapConsumer,
  source: string,
  file: FileCoverage
) {
  const generatedStart = consumer.generatedPositionFor({
    source,
    line: 1,
    column: 0
  });

  const content = consumer.sourceContentFor(source);
  const generatedEnd = consumer.generatedPositionFor({
    source,
    ...stringPos(content, content!.length)
  });

  const startIndex = stringPos.toIndex(file.text, generatedStart);
  const endIndex = stringPos.toIndex(file.text, generatedEnd);

  const overlap = file.ranges.reduce((acc, range) => {
    const totalRange =
      Math.max(range.end, endIndex) - Math.min(range.start, startIndex);
    const sumOfRanges = range.end - range.start + (endIndex - startIndex);

    if (sumOfRanges > totalRange) {
      acc += Math.min(range.end, endIndex) - Math.max(range.start, startIndex);
    }
    return acc;
  }, 0);

  return overlap / (endIndex - startIndex);
}
