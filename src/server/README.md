# carljdp/vscode-ext-makit-work/src/server

The intent of this project/package is just as a fresh start for a Node + TypeScript project. It is not intended to be a full-fledged project template, but rather a starting point for a new project.

## Table of Contents

- [Decisions](#decisions)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Debugging](#debugging)
- [Testing](#testing)
- [Linting](#linting)
- [Formatting](#formatting)
- [License](#license)
- [Contact](#contact)

## Decisions

### Dev tools

- Node.js: Chosen for its widespread adoption and support across development environments.
- TypeScript: Utilized for its robust type-safety features, enhancing code quality and maintainability.
- SWC: Selected for its speed in compiling TypeScript, significantly reducing build times.
- ESLint: Used for maintaining code quality and consistency across the project.

### Compile target and module system

- ES2022: Adopted to leverage the latest JavaScript features, ensuring future compatibility.
- EcmaScript Modules (ESM): Chosen for their modern approach to handling modules, aligning with the latest development standards.

## Prerequisites

- Node.js v21.7.3 or later
- Your choice of package manager. I used pnpm v8.15.5

## Installation

```bash
git clone https://github.com/carljdp/vscode-ext-makit-work.git
cd vscode-ext-makit-work/src/server
pnpm install
```

## Configuration

- `tsconfig.json` - TypeScript configuration file
- `tsconfig.eslint.json` - TypeScript configuration with ES Lint specific settings
- `eslint.config.mjs` - ESLint 'flat' configuration file
- `preloader.js` - SWC TypeScript loader registration
- `.swcrc` - SWC configuration file
- `.swc.cli.json` - SWC CLI configuration file

## Usage

<!-- ```bash
pnpm run start
``` -->

## Development

<!-- ```bash
pnpm run dev
``` -->

## Debugging

`--import=./preloader.js` launch configuration option is used to register the @swc typescript loader with Node. 

Issues were noted with Node 20.9.0 which were resolved by upgrading to Node 22.1.0. The exact problematic version is unclear, but compatibility improved with Node 21.7.3 onwards.

- Debug configurations are located in .vscode/launch.json which allows for launching and debugging individual TypeScript files.

## Testing

<!-- ```bash
pnpm run test
``` -->

## Linting

<!-- ```bash
pnpm run lint
``` -->

## Formatting

<!-- ```bash
pnpm run format
``` -->

## License

Due to the need to buy food and pay rent, this project is proprietary and not open source. You are not allowed to use this project for any purpose, commercial or otherwise, without the explicit written permission of the [author](https://linktr.ee/carljdp).

## Contact

For permissions or inquiries regarding the use of this project, please contact the [author](https://linktr.ee/carljdp).