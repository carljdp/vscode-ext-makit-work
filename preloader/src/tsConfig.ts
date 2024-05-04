// src-file: ./preloader/src/tsConfig.ts

import { RegisterOptions } from "ts-node";

/**
 * 
 * @see {@link https://typestrong.org/ts-node/api/interfaces/RegisterOptions.html}
 * 
 * @see {@link https://www.typescriptlang.org/docs/handbook/compiler-options.html} 
 * 
 * @see {@link https://www.typescriptlang.org/tsconfig/} 
 */


const _tsConfig = {
    compilerOptions: {
        TypeChecking: {
            // allowUnreachableCode: undefined,
            // allowUnusedLabels: undefined,
            alwaysStrict: true,
            // exactOptionalPropertyTypes: undefined,
            // noFallthroughCasesInSwitch: undefined,
            // noImplicitAny: undefined,
            // noImplicitOverride: undefined,
            // noImplicitReturns: undefined,
            // noImplicitThis: undefined,
            // noPropertyAccessFromIndexSignature: undefined,
            // noUncheckedIndexedAccess: undefined,
            // noUnusedLocals: undefined,
            // noUnusedParameters: undefined,
            strict: true,
            // strictBindCallApply: undefined,
            // strictFunctionTypes: undefined,
            // strictNullChecks: undefined,
            // strictPropertyInitialization: undefined,
            // useUnknownInCatchVariables: undefined,
        },
        Modules: {
            baseUrl: '.',

            module: 'CommonJS',
            // module: 'ES6',

            moduleResolution: 'Node',
            // paths: undefined,
            // rootDir: undefined,
            // rootDirs: undefined,
            // typeRoots: undefined,
            // types: undefined,
        },
        Emit: {
            declaration: true,
            // declarationDir: 'dist',
            // noEmit: false,

            // outDir: './dist/cjs',
            // outDir: './dist/esm',

            // outFile: 'dist',
            // removeComments: true,
            // sourceMap: true,
            // sourceRoot: './',
        },
        JsSupport: {
            allowJs: true,
            checkJs: true,
            // maxNodeModuleJsDepth: undefined,
        },
        EditorSupport: {
            // disableSizeLimit: undefined,
            // plugins: undefined,
        },
        InteropConstraints: {
            // allowSyntheticDefaultImports: undefined, 
            esModuleInterop: true,
            forceConsistentCasingInFileNames: true,
            // isolatedModules: undefined, 
            // preserveSymlinks: undefined,
            // verbatimModuleSyntax: undefined,
        },
        BackwardsCompat: {
            // charset: undefined, 
            // keyofStringsOnly: undefined, 
            // noImplicitUseStrict: undefined, 
            // noStrictGenericChecks: undefined, 
            // out: undefined, 
            // suppressExcessPropertyErrors: undefined, 
            // suppressImplicitAnyIndexErrors: undefined,
        },
        LangAndEnv: {
            // emitDecoratorMetadata: undefined, 
            experimentalDecorators: true,
            // jsx: undefined, 
            // jsxFactory: undefined, 
            // jsxFragmentFactory: undefined, 
            // jsxImportSource: undefined, 
            lib: ['ES2015'],
            // moduleDetection: undefined, 
            // noLib: undefined, 
            // reactNamespace: undefined, 
            target: 'ES2015',
            // useDefineForClassFields: undefined,
        },
        CompilerDiag: {
            // diagnostics: undefined,
            // explainFiles: undefined,
            // extendedDiagnostics: undefined,
            // generateCpuProfile: undefined,
            // listEmittedFiles: undefined,
            // listFiles: undefined,
            // traceResolution: undefined,
        },
        Projects: {
            // composite: undefined, 
            // disableReferencedProjectLoad: undefined, 
            // disableSolutionSearching: undefined, 
            // disableSourceOfProjectReferenceRedirect: undefined, 
            // incremental: undefined,
            // tsBuildInfoFile: undefined,
        },
        OutputFmt: {
            // noErrorTruncation: undefined,
            // preserveWatchOutput: undefined,
            // pretty: undefined,
        },
        Completeness: {
            // skipDefaultLibCheck: undefined,
            // skipLibCheck: undefined,
        },
        WatchOptions: {
            // assumeChangesOnlyAffectDirectDependencies: undefined,
        }
    },
};

// https://typestrong.org/ts-node/api/interfaces/RegisterOptions.html

export const tsConfig: RegisterOptions = {

    // Emit output files into .ts-node directory.
    // emit: true,

    // Enable native ESM support.
    // For details, see https://typestrong.org/ts-node/docs/imports#native-ecmascript-modules
    esm: true,

    // Use pretty diagnostic formatter.
    // pretty: true,

    // Skip project config resolution and loading.
    skipProject: true,

    // requires @swc/core to be installed
    swc: true,

    compilerOptions: {
        ..._tsConfig.compilerOptions.TypeChecking,
        ..._tsConfig.compilerOptions.Modules,
        ..._tsConfig.compilerOptions.Emit,
        ..._tsConfig.compilerOptions.JsSupport,
        ..._tsConfig.compilerOptions.EditorSupport,
        ..._tsConfig.compilerOptions.InteropConstraints,
        ..._tsConfig.compilerOptions.BackwardsCompat,
        ..._tsConfig.compilerOptions.LangAndEnv,
        ..._tsConfig.compilerOptions.CompilerDiag,
        ..._tsConfig.compilerOptions.Projects,
        ..._tsConfig.compilerOptions.OutputFmt,
        ..._tsConfig.compilerOptions.Completeness,
        ..._tsConfig.compilerOptions.WatchOptions,
    }
};