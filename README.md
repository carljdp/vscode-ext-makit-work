
## Conventions

### Directory Names

Se below, the folder naming conventions used in this monorepo. The intention was to be flexible and aimed to capture commonly used directories:

| Directory Name  | Description  |
| --------------- | ------------ |
| `apps`     | Top-level directory for application modules (Node.js, web, Electron). Each application module can have its own directory here. |
| `docs`     | Documentation related to the entire monorepo or individual projects. |
| `examples` | Example code snippets or applications for individual projects. |

| Directory Name  | Description  |
| --------------- | ------------ |
| `config`   | Configuration files for the whole monorepo, such as `.eslintrc`, `.prettierrc`, etc. |

| Directory Name  | Description  |
| --------------- | ------------ |
| `coverage` | Code coverage reports for individual projects. |
| `packages` | Common node_modules directory for managing package dependencies shared across multiple projects. |
| `tests`    | Centralized testing framework and shared test utilities across applications. |

| Directory Name  | Description  |
| --------------- | ------------ |
| `src`      | Source code for applications, libraries, or other modules. |
| `typings`  | Type definitions for TypeScript projects. |
| `assets`   | Images, fonts, and other static resources used across projects.|
| `private`  | Private files for web applications. |
| `public`   | Public files for web applications. |
| `vendor` or `libs`   | Third-party libraries or dependencies that are included/published along with the project. |

## Build and Output Directories

| Directory Name  | Description  |
| --------------- | ------------ |
| `dist`     | Output directory for compiled and bundled files, if relevant. |
| `build`    | Build output directory for individual projects. |
| `tmp` or `temp`      | Temporary files generated during the build or testing process. |
| `out` or `output`      | Output directory for test related build artifacts. |
| `logs`     | Log files for build/test operations. |


## Dependencies 

| Directory Name  | Description  |
| --------------- | ------------ |
| `node_modules` | Node.js dependencies for individual projects. |
| `local_modules` | Internal modules that are not intended for external use. |

# dev-time / build-time related directories

| Directory Name  | Description  |
| --------------- | ------------ |
| `scripts`  | Build and deployment automation scripts. |
| `utils`    | Utility scripts for build, test, or deployment operations. |
| `tools`    | Developer tools for use across applications, like linters. |