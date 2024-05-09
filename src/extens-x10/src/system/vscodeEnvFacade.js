"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XVS = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const USER_DATA_DIR_WINDO = "%APPDATA%\\Code";
const USER_DATA_DIR_LINUX = "$HOME/.config/Code";
const USER_DATA_DIR_MACOS = "$HOME/Library/Application Support/Code";
const EXTENSIONS_DIR_WINDO = "%USERPROFILE%\\.vscode\\extensions";
const EXTENSIONS_DIR_LINUX = "~/.vscode/extensions";
const EXTENSIONS_DIR_MACOS = "~/.vscode/extensions";
var Part;
(function (Part) {
    Part[Part["Name"] = 0] = "Name";
    Part[Part["Value"] = 1] = "Value";
})(Part || (Part = {}));
function objectFromEnum(part, enum_, default_) {
    const result = {};
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
var XVS;
(function (XVS) {
    // CONSTANTS
    XVS.DefaultDirs = {
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
    let OnFailReturn;
    (function (OnFailReturn) {
        OnFailReturn[OnFailReturn["AsIs"] = 0] = "AsIs";
        OnFailReturn[OnFailReturn["Empty"] = 1] = "Empty";
        OnFailReturn[OnFailReturn["Null"] = 2] = "Null";
    })(OnFailReturn = XVS.OnFailReturn || (XVS.OnFailReturn = {}));
    let RuntimeEnv;
    (function (RuntimeEnv) {
        RuntimeEnv[RuntimeEnv["Mac"] = 0] = "Mac";
        RuntimeEnv[RuntimeEnv["Windows"] = 1] = "Windows";
        RuntimeEnv[RuntimeEnv["Linux"] = 2] = "Linux";
        RuntimeEnv[RuntimeEnv["Web"] = 3] = "Web";
        RuntimeEnv[RuntimeEnv["Unsupported"] = 4] = "Unsupported";
    })(RuntimeEnv = XVS.RuntimeEnv || (XVS.RuntimeEnv = {}));
    let SupportedEnv;
    (function (SupportedEnv) {
        SupportedEnv[SupportedEnv["Mac"] = 0] = "Mac";
        SupportedEnv[SupportedEnv["Windows"] = 1] = "Windows";
        SupportedEnv[SupportedEnv["Linux"] = 2] = "Linux";
    })(SupportedEnv = XVS.SupportedEnv || (XVS.SupportedEnv = {}));
    let Directory;
    (function (Directory) {
        Directory[Directory["UserData"] = 0] = "UserData";
        Directory[Directory["Extensions"] = 1] = "Extensions";
    })(Directory = XVS.Directory || (XVS.Directory = {}));
    function getRuntimeEnv() {
        if (vscode.env.uiKind === vscode.UIKind.Web) {
            return RuntimeEnv.Web;
        }
        else {
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
    XVS.getRuntimeEnv = getRuntimeEnv;
    // TEMPLATED FUNCTIONS
    function _getDefaultUserDataDir_(runtimeEnv, onFailCb) {
        switch (runtimeEnv) {
            case RuntimeEnv.Mac:
                return XVS.DefaultDirs.UserData.Mac;
            case RuntimeEnv.Windows:
                return XVS.DefaultDirs.UserData.Windows;
            case RuntimeEnv.Linux:
                return XVS.DefaultDirs.UserData.Linux;
            default:
                return onFailCb(runtimeEnv, new Error('Unsupported platform'));
        }
    }
    XVS._getDefaultUserDataDir_ = _getDefaultUserDataDir_;
    function _getDefaultExtensionsDir_(runtimeEnv, onFailCb) {
        switch (runtimeEnv) {
            case RuntimeEnv.Mac:
                return XVS.DefaultDirs.Extensions.Mac;
            case RuntimeEnv.Windows:
                return XVS.DefaultDirs.Extensions.Windows;
            case RuntimeEnv.Linux:
                return XVS.DefaultDirs.Extensions.Linux;
            default:
                return onFailCb(runtimeEnv, new Error('Unsupported platform'));
        }
    }
    XVS._getDefaultExtensionsDir_ = _getDefaultExtensionsDir_;
    function _resolveRelativePath_(inputPath, onFailCb) {
        return __awaiter(this, void 0, void 0, function* () {
            if (inputPath === null) {
                return onFailCb(inputPath, new Error('Input path is null'));
            }
            // Replace $HOME or ~ with the user's home directory
            let resolvedPath = inputPath.replace(/^~|\$HOME/, os.homedir());
            // Replace environment variables like %APPDATA%
            resolvedPath = resolvedPath.replace(/%([^%]+)%/g, (_, key) => { var _a; return (_a = process.env[key]) !== null && _a !== void 0 ? _a : ''; });
            // Use path.resolve to get an absolute path (this also handles . and ..)
            try {
                resolvedPath = path.resolve(resolvedPath);
                return resolvedPath;
            }
            catch (error) {
                return onFailCb(inputPath, error);
            }
        });
    }
    // CONCRETE FUNCTIONS
    /**
     * Get the default user data directory for the current platform
     * @param platform The platform to get the default user data directory for
     * @returns The default user data directory for the platform, or null on failure
     */
    function getDefaultUserDataDirOrNull() {
        return _getDefaultUserDataDir_(getRuntimeEnv(), (_original, error) => {
            console.error('Failed to get the default user data directory:', error);
            return null;
        });
    }
    XVS.getDefaultUserDataDirOrNull = getDefaultUserDataDirOrNull;
    /**
     * Get the default extensions directory for the current platform
     * @param platform The platform to get the default extensions directory for
     * @returns The default extensions directory for the platform, or null on failure
     */
    function getDefaultExtensionsDirOrNull() {
        return _getDefaultExtensionsDir_(getRuntimeEnv(), (_original, error) => {
            console.error('Failed to get the default extensions directory:', error);
            return null;
        });
    }
    XVS.getDefaultExtensionsDirOrNull = getDefaultExtensionsDirOrNull;
    function resolveRelativePathOrNull() {
        return __awaiter(this, arguments, void 0, function* (path = null) {
            return _resolveRelativePath_(path, (_original, error) => {
                console.error('Failed to resolve the relative path:', error);
                return null;
            });
        });
    }
    XVS.resolveRelativePathOrNull = resolveRelativePathOrNull;
    function getUserDataDirResolvedOrNull() {
        return __awaiter(this, void 0, void 0, function* () {
            return resolveRelativePathOrNull(getDefaultUserDataDirOrNull());
        });
    }
    XVS.getUserDataDirResolvedOrNull = getUserDataDirResolvedOrNull;
    function getExtensionsDirResolvedOrNull() {
        return __awaiter(this, void 0, void 0, function* () {
            return resolveRelativePathOrNull(getDefaultUserDataDirOrNull());
        });
    }
    XVS.getExtensionsDirResolvedOrNull = getExtensionsDirResolvedOrNull;
    class FilePaths {
        constructor(path) {
            this._initial = path;
        }
        static from(path) {
            return new FilePaths(path);
        }
        join(path) {
            return new FilePaths(path);
        }
        get initial() {
            return this._initial;
        }
        ;
        get resolved() {
            return resolveRelativePathOrNull(this._initial);
        }
        ;
    }
    XVS.FilePaths = FilePaths;
    class UserData {
    }
    UserData._dir = FilePaths.from(getDefaultUserDataDirOrNull());
    UserData.keybindingsJson = FilePaths.from(UserData._dir.join('User/keybindings.json').initial);
    UserData.tasksJson = FilePaths.from(UserData._dir.join('User/tasks.json').initial);
    UserData.settingsJson = FilePaths.from(UserData._dir.join('User/settings.json').initial);
    UserData.globalStateJson = FilePaths.from(UserData._dir.join('User/globalStorage/globalState.json').initial);
    UserData.storageJson = FilePaths.from(UserData._dir.join('User/globalStorage/storage.json').initial);
    UserData.profilesDir = FilePaths.from(UserData._dir.join('User/profiles').initial);
    XVS.UserData = UserData;
    class Extensions {
    }
    Extensions._dir = FilePaths.from(getDefaultExtensionsDirOrNull());
    XVS.Extensions = Extensions;
})(XVS || (exports.XVS = XVS = {}));
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
