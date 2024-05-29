
## Decisions

### Mono-repo

- Because there are just too many things to keep track of, and I don't want to have to manage multiple repositories.
- There are especially a very many shared configurations that need to be kept in sync across multiple projects.
  - The only alternative I can see to these shared static configs is symlink-ing, but I'd rather not mix that with git.


### VS Code as the primary IDE

- Ideally it would be nice for our project to be IDE-agnostic, and run (or be easy to setup) anywhere.
- BUT, Multiple parts of this project is geared towards graphical (non text-only) interfaces, and as such, VS Code (or the underlying Codium/Electron) is the best choice for that
  - developing our tools, intented for a codium-like ide, in a codium-like ide, makes sense.

## Conventions

aside: also see https://eslint.org/docs/latest/contribute/development-environment#directory-structure for ideas on how to structure a project.

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


**UPDATE**


Our custom configs need to know whether they should use sourceType 'module' or 'commonjs' when it comes to files with non-specific extensions '.js'|'.ts'.
- so that it can apply the correct includes/excludes and rules for the correct file type.
- also useful info to keep about, because SWC also likes to know the source-type of the file it is compiling, e.g. 'module'|'commonjs'|'script'.

A quirk of our current setup:
- if we set `"type": "module"` in the `package.json` (as per the previous update above), then:
  - our (current )custom eslint configuration will look only at that package.json file to determine the sourceType of the file
  - BUT, since there are differing sourceTypes in package.json files in nested directories per package (e.g. dist/esm and dist/cjs),
    - the configs now rely on the wrong sourceType, and apply the wrong includes/excludes and rules to the wrong files.
- see [eslint.config.mjs:341 - getPackageSourceTypeId()](./eslint.config.mjs)


**UPDATE**

above mostly resolved..


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

<br>

For a folder containing ***code that is meant to be importable into any other `scrip|module|commonjs` code***:
- **use `lib`** as the directory name
- this will avoid confusion as compared to: (don't use these)
  - `common` which could be mistaken for CJS only
  - `shared` which is too generic/ambiguous/vague, and could have connectations to state/templates/etc.

<br>

For a folder containing built/compiled files:
- **use `dist`** as the directory name
  - I know this depends on the build tool, but it is a common convention and is easy to remember.
  - this will avoid confusion as compared to: (don't use these)
    - `build` which could be mistaken for the build scripts
    - `out` which is too generic/ambiguous/vague, and could have connectations to tests/tty/pipe/logs.

<br>

For a folder containing ***code that was built targeting a specific module system***:
- **use `cjs` or `esm`** as the directory name
  - This decision is arbitrary, but it is a common convention, and length is kept to the same minimum.
  - this will avoid confusion as compared to: (don't use these)
    - `commonjs|esmodule` which are too long
    - `common|module` which are too generic/ambiguous/vague

<br>

> meh / undecided / other Copilot suggestions that came up:
>
> For a folder containing ***code that is meant to be run as a standalone `script`***:
> - **use `bin`** as the directory name

#### Root

| Directory Name  | Description  |
| --------------- | ------------ |
| `<root>/apps`          | Top-level directory for sub-projects meant as user facing apps/tools |
| `<root>/pkgs`          | Top-level directory for sub-projects meant as dev facing libraries/packages |


#### Per Module

| Directory Name  | Description  |
| --------------- | ------------ |
| `.cache`        | Adhoc e.g. for .cache/eslint |
| `<module>/conf` | Source configs used to generate the real config files |
| `<module>/devt` | Build, configuration & deployment scripts / tools. |
| `<module>/docs` | Documentation. |
| `<module>/libs` | Libraries to be published alongside the application. |
| `<module>/src`  | Source code. |

Undecided:

| Directory Name  | Description  |
| --------------- | ------------ |
| `<module>/www`  | Public files. |


#### Generated

Generated files that should have no effect when deleted.

| Directory Name  | Description  |
| --------------- | ------------ |
| `<module>/dist` | Output directory for compiled files. |


Undecided:

| Directory Name  | Description  |
| --------------- | ------------ |
| `<module>/temp` | Temporary files. |
| `<module>/logs` | Log files. |

#### 3rd-party

| Directory Name  | Description  |
| --------------- | ------------ |
| `node_modules`  | Node.js dependencies for individual projects. |
| `.vscode`       | Visual Studio Code configuration files. |


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


## Code Style

### Imports

#### Relative imports?

Importing files from within the same package? YES

Importing files from another package, but still from withing our mono-repo:
- if possible, use non-relative imports, e.g. `import { foo } from 'pkg/lib'`
  - via `pnpm` or `yarn` workspaces, this will resolve to the correct package.
  - this avoids confusion with when traversing up/down the directory tree.

#### include file extensions?

Importing a file: YES
  - This is because it is more explicit and less error-prone.
  - It also avoids issues with case-insensitive file systems.
  - It removes the guess-work needed to determine if we are importing a file, a directory, or a package.

Importing a package: NO

#### type of file extension?

i.e. plan `js` vs `mjs`|`cjs`|`esm`|etc.

// TODO: STILL UNDECIDED / UNCERTAIN / INCLEAR

Importing a package: No extension, as mentioned above.

Importing a specific file from a package:

- [ ] Ideally would like to stick with `.js`|`.ts`, and let the import mechanism **resolve** the correct file
  - e.g. depending on the package.json's `type`, `main`, `module`, `bin`, `exports` fileds.

Quirks:
- for some not-yet-known-reason, we have to **(inconsistently)** use `.js` inside TypeScript files, even if that source code only exists as a `.ts` file.
  - this is a common work around, because the compiler does not transform the imported 'path/file.extension' during compilation.
    - i.e. if you imported a `.ts` file in your source code, the compiler outputs the same `.ts` file in the compiled output `.js` file **(inexplicable, but true)**.
