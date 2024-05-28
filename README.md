
## Decisions

### Mono-repo

- Because there are just too many things to keep track of, and I don't want to have to manage multiple repositories.
- There are especially a very many shared configurations that need to be kept in sync across multiple projects.
  - The only alternative I can see to these shared static configs is symlink-ing, but I'd rather not mix that with git.

## Conventions

also see https://eslint.org/docs/latest/contribute/development-environment#directory-structure

Conventions used in this 'mono-repo'

### Package.json

- ~~As far as possible, to not use `"type": "module"` in `package.json`.~~ This is because it is not yet supported by all tools and libraries. Instead, use `.mjs` extension for ES modules. Exceptions to the rule:
  - Build scripts should place a `package.json` file in the `dist` directory with `"type"` set to `"module"` or `"commonjs"` as appropriate.

**UPDATE**

Prefer explicit use of `"type": "module"` in `package.json` as a signal that we intend to default to ESM in cases where it is not obvious to determine the original intent - to avoid confusion and potential issues.

Who uses this information?
- Node.js: To determine whether to use CommonJS or ESM for module resolution/loading.
- SWC also likes to know the source-type of the file it is compiling, e.g. 'module'|'commonjs'|'script'.
- Our own custom eslint configuration checks inside package.json to determine what rules to apply for bare '.js'|'.ts' files.


### Configuration files

- As far as possible, stick with using (dynamic) code based `js|mjs` configuration files instead of (static) `rc|json|yaml` configuration files. This allows us to dynamically generate configurations and reduce duplication of configuration settings across multiple packages.

### Directory Names

- no spaces in directory names.

Preferably, but not mandatory:
- use `kebab-case` for directory names
- dotfiles / dotdirs should be used for configuration files only.

The following directory names were chosen with the following conventions in mind:
- all lowercase, no spaces, no special characters, no underscores, no camelCase
- approximately 3-5 characters long, 4 characters preferred
- use common abbreviations/terms where possible
- less important:
  - consider alphabetical order in the list of directories
  - the directory name should be descriptive of the contents
  - avoid using the same name as a common package or tool
  - the meaning should be clear to someone who is not familiar with the project

#### Root

| Directory Name  | Description  |
| --------------- | ------------ |
| `<root>/apps`          | Top-level directory for application modules. Each application module can have its own directory here. |


#### Per Module

To be committed to the repository.

| Directory Name  | Description  |
| --------------- | ------------ |
| `<module>/devt` | Build, configuration & deployment scripts / tools. |
| `<module>/docs` | Documentation. |
| `<module>/libs` | Libraries to be published alongside the application. |
| `<module>/src`  | Source code. |
| `<module>/www`  | Public files. |


#### Generated

Generated files that should have no effect when deleted.

| Directory Name  | Description  |
| --------------- | ------------ |
| `<module>/dist`  | Output directory for compiled files. |
| `<module>/temp`  | Temporary files. |
| `<module>/logs`  | Log files. |


#### 3rd-party

Local 'caching'

| Directory Name  | Description  |
| --------------- | ------------ |
| `node_modules`  | Node.js dependencies for individual projects. |
| `.vscode`       | Visual Studio Code configuration files. |
| `.cache`       | Adhoc e.g. for .cache/eslint |



## Rationale behind dependencies

### TODO

- `prettier` is used for code formatting because it is the most popular and widely used code formatter for JavaScript and TypeScript.

### Linting

- `typescript` for strict type-checking and ES6+ features that are not provided by SWC.

- `eslint` is used for linting because it is the most popular and widely used linter for JavaScript and TypeScript.
- `globals` used to augment eslint configurations with global variables.
- `@eslint/js` provides a set of recommended rules for JavaScript.
- `typescript-eslint` extends eslint to support TypeScript, and provides a set of recommended rules for TypeScript, a parser, and a plugin.

- `@eslint/config-inspector` provides a web interface for inspecting/debugging eslint configurations.

Custom eslint watch script:
- `chokidar` is used to watch files for changes.
- `bundle-require` to import the ESLint configuration (peer dependency: `esbuild`)


### Compiling

- `@swc/core` + `@swc/cli` is used for compiling because it is a fast and modern JavaScript/TypeScript compiler.

### Debugging

- `@swc-node/register` as a require hook for SWC. This allows us to use SWC to compile and run TypeScript files without having to compile them first.

### Testing

// TODO: need to come back to this once we figured out / solved shared eslint config issues for our mono-repo

- `mocha` is used as the test runner. because? meh, i don't know. it's just what i'm used to.
  Mocha VS Code extensions expect these dependencies to be installed:
  - `nyc` is used for code coverage.
  - `ts-node` used as preloader for TypeScript files.

- `chai` is used for assertions. because? meh, i don't know. it's just what i'm used to.

- VS Code Extension: Extension Test Runner (ms-vscode.extension-test-runner)
  Dependencies:
  - `@vscode/test-cli` - just install it, else it wont shut up about it :/