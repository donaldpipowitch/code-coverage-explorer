# `code-coverage-explorer`

[![Build Status](https://travis-ci.org/donaldpipowitch/code-coverage-explorer.svg?branch=master)](https://travis-ci.org/donaldpipowitch/code-coverage-explorer)

> Shows original source code of unused code coverage reports if source maps are available.

⚠️ This is just a prototype. If you're interested in this tool and would like to see more polishing consider [supporting me at Patreon](https://www.patreon.com/donaldpipowitch). ⚠️

## Install

Install this package globally via npm or yarn:

```bash
$ npm install --global code-coverage-explorer
# or
$ yarn global add code-coverage-explorer
```

## Usage

After the installation you can use the `code-coverage-explorer` command like this:

```bash
$ code-coverage-explorer --file /path/to/coverage.json
```

This shows all files which have less than 50% of unused code by default. If you want to change this threshold (e.g. set it to 10%) you can do it like this:

```bash
$ code-coverage-explorer --file /path/to/coverage.json --threshold 0.1
```

You can get a `coverage.json` [as explained here](https://developers.google.com/web/updates/2019/01/devtools#coverage).

Reports look like this:

```bash
"http://localhost:8080/some-path" is no JS file. Skipped.

"http://localhost:8080/config.js" has no source map. Skipped.

"http://localhost:8080/index.js" has 4 files with less than 50% unused code:
  Unused code in "webpack:///shared/src/components/Logo/assets/internal-logo.svg": 0%
  Unused code in "webpack:///shared/src/components/Auth/NoHashError.ts": 2%
  Unused code in "webpack:///Users/pipo/workspace/some-project/node_modules/core-js/library/modules/_dom-create.js": 10%
  Unused code in "webpack:///Users/pipo/workspace/some-project/node_modules/core-js/library/modules/_html.js": 11%
```

(Note: You can also use this package as a lib: `require('code-coverage-explorer').check(require('/path/to/coverage.json'))`.)
