
## Conventions

Conventions used in this 'mono-repo'

### Package.json

- As far as possible, to not use `"type": "module"` in `package.json`. This is because it is not yet supported by all tools and libraries. Instead, use `.mjs` extension for ES modules. Exceptions to the rule:
  - Build scripts should place a `package.json` file in the `dist` directory with `"type"` set to `"module"` or `"commonjs"` as appropriate.


### Configuration files

- As far as possible, stick with using `.js` (or `.mjs`) configuration files instead of `.json` or `.yaml`. This allows us to dynamically generate configuration values using code.

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

