
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

const USER_DATA_DIR_WINDO: Readonly<string> = "%APPDATA%\\Code";
const USER_DATA_DIR_LINUX: Readonly<string> = "$HOME/.config/Code";
const USER_DATA_DIR_MACOS: Readonly<string> = "$HOME/Library/Application Support/Code";

const EXTENSIONS_DIR_WINDO: Readonly<string> = "%USERPROFILE%\\.vscode\\extensions";
const EXTENSIONS_DIR_LINUX: Readonly<string> = "~/.vscode/extensions";
const EXTENSIONS_DIR_MACOS: Readonly<string> = "~/.vscode/extensions";


enum Part {
    Name,
    Value,
}

function objectFromEnum<T extends Record<string, number | string>, U>(
    part: Part,
    enum_: T,
    default_: U
): Record<string, U> {
    const result: Record<string, U> = {};
    Object.entries(enum_).forEach(([name, value]) => {
        // Ensuring only actual enum names are used, not reverse mappings
        if (isNaN(Number(name))) {
            const key = part === Part.Name ? name : value.toString();
            result[key] = default_;
        }
    });
    return result;
}

/**
 * @namespace XVS Cross-Platform Visual Studio Code
 */
export namespace XVS {

    // CONSTANTS

    export const DefaultDirs = {
        UserData: {
            Windows: "%APPDATA%\\Code",
            Linux: "$HOME/.config/Code",
            Mac: "$HOME/Library/Application Support/Code",
        },
        Extensions: {
            Windows: "%USERPROFILE%\\.vscode\\extensions",
            Linux: "~/.vscode/extensions",
            Mac: "~/.vscode/extensions",
        }
    };

    export enum OnFailReturn {
        AsIs,
        Empty,
        Null,
    }

    export type onFailFn<T, U> = (original: T, error: Error) => U;

    export enum RuntimeEnv {
        Mac,
        Windows,
        Linux,
        Web,
        Unsupported
    }

    export enum SupportedEnv {
        Mac,
        Windows,
        Linux,
    }

    export enum Directory {
        UserData,
        Extensions
    }

    export function getRuntimeEnv(): RuntimeEnv {
        if (vscode.env.uiKind === vscode.UIKind.Web) {
            return RuntimeEnv.Web;
        } else {
            switch (process.platform) {
                case 'darwin':
                    return RuntimeEnv.Mac;
                case 'win32':
                    return RuntimeEnv.Windows;
                case 'linux':
                    return RuntimeEnv.Linux;
                default:
                    return RuntimeEnv.Unsupported;
            }
        }
    }

    // TEMPLATED FUNCTIONS

    export function _getDefaultUserDataDir_<T extends RuntimeEnv, U>(runtimeEnv: T, onFailCb: onFailFn<T, U>): string | U {
        switch (runtimeEnv) {
            case RuntimeEnv.Mac:
                return DefaultDirs.UserData.Mac;
            case RuntimeEnv.Windows:
                return DefaultDirs.UserData.Windows;
            case RuntimeEnv.Linux:
                return DefaultDirs.UserData.Linux;
            default:
                return onFailCb(runtimeEnv, new Error('Unsupported platform'));
        }
    }

    export function _getDefaultExtensionsDir_<T extends RuntimeEnv, U>(runtimeEnv: T, onFailCb: onFailFn<T, U>): string | U {

        switch (runtimeEnv) {
            case RuntimeEnv.Mac:
                return DefaultDirs.Extensions.Mac;
            case RuntimeEnv.Windows:
                return DefaultDirs.Extensions.Windows;
            case RuntimeEnv.Linux:
                return DefaultDirs.Extensions.Linux;
            default:
                return onFailCb(runtimeEnv, new Error('Unsupported platform'));
        }
    }

    async function _resolveRelativePath_<T extends string | null, U>(inputPath: T, onFailCb: onFailFn<T, U>): Promise<string | U> {
        if (inputPath === null) {
            return onFailCb(inputPath, new Error('Input path is null'));
        }

        // Replace $HOME or ~ with the user's home directory
        let resolvedPath = inputPath.replace(/^~|\$HOME/, os.homedir());

        // Replace environment variables like %APPDATA%
        resolvedPath = resolvedPath.replace(/%([^%]+)%/g, (_, key) => process.env[key] ?? '');

        // Use path.resolve to get an absolute path (this also handles . and ..)
        try {
            resolvedPath = path.resolve(resolvedPath);
            return resolvedPath;
        } catch (error) {
            return onFailCb(inputPath, error as Error);
        }
    }

    // CONCRETE FUNCTIONS

    /**
     * Get the default user data directory for the current platform
     * @param platform The platform to get the default user data directory for
     * @returns The default user data directory for the platform, or null on failure
     */
    export function getDefaultUserDataDirOrNull() {
        return _getDefaultUserDataDir_<RuntimeEnv, null>(getRuntimeEnv(), (_original, error) => {
            console.error('Failed to get the default user data directory:', error);
            return null;
        });
    }

    /**
     * Get the default extensions directory for the current platform
     * @param platform The platform to get the default extensions directory for
     * @returns The default extensions directory for the platform, or null on failure
     */
    export function getDefaultExtensionsDirOrNull() {
        return _getDefaultExtensionsDir_<RuntimeEnv, null>(getRuntimeEnv(), (_original, error) => {
            console.error('Failed to get the default extensions directory:', error);
            return null;
        });
    }

    export async function resolveRelativePathOrNull(path: string | null = null) {
        return _resolveRelativePath_<string | null, null>(path, (_original, error) => {
            console.error('Failed to resolve the relative path:', error);
            return null;
        });
    }

    export async function getUserDataDirResolvedOrNull() {
        return resolveRelativePathOrNull(getDefaultUserDataDirOrNull());
    }

    export async function getExtensionsDirResolvedOrNull() {
        return resolveRelativePathOrNull(getDefaultUserDataDirOrNull());
    }

    export class FilePaths {

        private _initial: string | null;

        private constructor(path: string | null) {
            this._initial = path;
        }

        public static from(path: string | null) {
            return new FilePaths(path);
        }
        public join(path: string | null) {
            return new FilePaths(path);
        }

        public get initial(): string | null {
            return this._initial;
        };
        public get resolved(): Promise<string | null> {
            return resolveRelativePathOrNull(this._initial);
        };
    }


    export class UserData {

        private static readonly _dir = FilePaths.from(getDefaultUserDataDirOrNull());

        static readonly keybindingsJson = FilePaths.from(UserData._dir.join('User/keybindings.json').initial);
        static readonly tasksJson = FilePaths.from(UserData._dir.join('User/tasks.json').initial);
        static readonly settingsJson = FilePaths.from(UserData._dir.join('User/settings.json').initial);

        static readonly globalStateJson = FilePaths.from(UserData._dir.join('User/globalStorage/globalState.json').initial);
        static readonly storageJson = FilePaths.from(UserData._dir.join('User/globalStorage/storage.json').initial);

        static readonly profilesDir = FilePaths.from(UserData._dir.join('User/profiles').initial);

        // TODO: populate dictionary with all possible profile files
        // from storage.json["userDataProfiles"]
        // optional, confirm they exist in the profiles directory?
        //
        // Each profile then also contains:
        // - extensions.json
        // - keybindings.json
        // - settings.json
        // - tasks.json

        // real location of most extensions:
        // ~/.vscode/extensions.storage/*
        // else ~/.vscode/extensions/* which links to ~/.vscode/profiles/Default/* ??

        // ~/.vscode-insiders/extensions/extensions.json

    }

    export class Extensions {

        private static readonly _dir = FilePaths.from(getDefaultExtensionsDirOrNull());

    }

}


export namespace _encapsulated_ {

    /**
     * @namespace _settings_
     * @description The `settings.json` file is used to store the list of
     * user settings. It is located in the following directories:
     * - `<userDataDir>/User/[profiles/<profileId>/]settings.json`
     * - `<userDataDir>/User/sync/[<profileId>/]settings.json`
     */
    export namespace _settings_ {

        export interface SettingsJson {
            [key: string]: any; // doc-level object / dictionary
        }

    } // namespace _settings_

    /**
     * @namespace _keybindings_
     * @description The `keybindings.json` file is used to store the list of
     * user keybindings. It is located in the following directories:
     * - `<userDataDir>/User/profiles/<profileId>/keybindings.json`
     */
    export namespace _keybindings_ {

        export interface Keybinding {
            key: string;
            command: string;
            when?: string;
            args?: any;
        }

        export interface KeybindingsJson {
            keybindings: Keybinding[]; // doc-level array / list / collection
        }

    } // namespace _keybindings_

    /**
     * @namespace _extensions_
     * @description The `extensions.json` file is used to store the list of
     * user extensions. It is located in the following directories:
     * - `~/.vscode/extensions/extensions.json`
     * - `<userDataDir>/User/profiles/<profileId>/extensions.json`
     * - `<userDataDir>/User/sync/[<profileId>/]extensions/lastSyncextensions.json`
     */
    export namespace _extensions_ {

        export interface ExtensionsJson {
            extensions: Extension[]; // doc-level array / list / collection
        }

        export interface ExtensionIdentifier {
            id: string; // 'publisher.extension-name' style, lowercase
            uuid: string; // uuid
        }

        export interface ExtensionLocation {
            $mid: number; // always 1 ?
            path: string; // `/c:/Users/..` style
            scheme: string; // always 'file' ?
            _sep?: number; // always 1 when present
            fsPath?: string; // native style when present `"c:\\Users\\..`
            external?: string; // uri style when present `"file:///c%3A/Users/..`
        }

        export interface ExtensionMetadata {
            id: string; // uuid
            publisherId: string; // uuid
            publisherDisplayName: string;
            targetPlatform: string; // 'undefined' | 'win32-x64'
            updated: boolean;
            isPreReleaseVersion: boolean;
            hasPreReleaseVersion: boolean;
            installedTimestamp: number; // epoch number
            isApplicationScoped?: boolean; // either when present
            preRelease?: boolean; // either when present
            pinned?: boolean; // mostly false when present
            source?: string; // always 'gallery' ?
        }

        export interface Extension {
            identifier: ExtensionIdentifier;
            version: string; // always /\d+\.\d+\.\d+/ style
            location: ExtensionLocation;
            relativeLocation: string; // always 'publisher.extension-name-1.2.3' style
            metadata: ExtensionMetadata;
        }

    } // namespace _extensions_

} // namespace _encapsulated_


// > The precedence of settings in Visual Studio Code from highest to lowest is
// > as follows:
// >
// > 1. Folder Settings: These settings are stored in a .vscode folder within the
// > workspace folder. They only apply to the specific folder and override any
// > other settings. They're useful in multi-root workspaces where you might need
// > different settings for different parts of your project.
// >
// > 1. Workspace Settings: These settings are stored in the workspace file
// > (.code-workspace) and apply to the entire workspace. They override user
// > settings but are overridden by folder settings in multi-root workspaces.
// >
// > 1. Profile Settings: Profile settings are a relatively newer concept and
// > allow users to have different sets of configurations (which include user
// > settings, extensions, and UI state) tailored for specific tasks or projects.
// > The exact precedence of profile settings can be nuanced, as they
// > essentially provide a new set of user settings. When you're within a
// > specific profile, its settings act as your "user settings" for the context
// > of that profile, effectively placing them at the same level as user
// > settings but isolated to the profile context.
// >
// > 1. User Settings: These are global settings that apply to all instances
// > of VS Code across all workspaces and folders, unless overridden by
// > higher-precedence settings. They are stored in the user's home directory.
// >
// > When you configure settings in VS Code, it's important to consider this
// > hierarchy to ensure that your configurations behave as expected. Folder
// > settings have the highest precedence, allowing for fine-grained control
// > over specific parts of your projects, followed by workspace settings
// > that apply to the entire workspace. Profile settings allow you to
// > switch between different sets of configurations easily, acting at the
// > user level for the selected profile. Lastly, user settings provide a
// > baseline that applies universally across your workspaces unless
// > specifically overridden.