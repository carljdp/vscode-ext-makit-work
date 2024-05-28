"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "XVS", {
    enumerable: true,
    get: function() {
        return XVS;
    }
});
const _os = /*#__PURE__*/ _interop_require_wildcard(require("os"));
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
const _vscode = /*#__PURE__*/ _interop_require_wildcard(require("vscode"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const USER_DATA_DIR_WINDO = "%APPDATA%\\Code";
const USER_DATA_DIR_LINUX = "$HOME/.config/Code";
const USER_DATA_DIR_MACOS = "$HOME/Library/Application Support/Code";
const EXTENSIONS_DIR_WINDO = "%USERPROFILE%\\.vscode\\extensions";
const EXTENSIONS_DIR_LINUX = "~/.vscode/extensions";
const EXTENSIONS_DIR_MACOS = "~/.vscode/extensions";
var Part;
(function(Part) {
    Part[Part["Name"] = 0] = "Name";
    Part[Part["Value"] = 1] = "Value";
})(Part || (Part = {}));
function objectFromEnum(part, enum_, default_) {
    const result = {};
    Object.entries(enum_).forEach(([name, value])=>{
        // Ensuring only actual enum names are used, not reverse mappings
        if (isNaN(Number(name))) {
            const key = part === 0 ? name : value.toString();
            result[key] = default_;
        }
    });
    return result;
}
var XVS;
(function(XVS) {
    // CONSTANTS
    XVS.DefaultDirs = {
        UserData: {
            Windows: "%APPDATA%\\Code",
            Linux: "$HOME/.config/Code",
            Mac: "$HOME/Library/Application Support/Code"
        },
        Extensions: {
            Windows: "%USERPROFILE%\\.vscode\\extensions",
            Linux: "~/.vscode/extensions",
            Mac: "~/.vscode/extensions"
        }
    };
    let OnFailReturn;
    (function(OnFailReturn) {
        OnFailReturn[OnFailReturn["AsIs"] = 0] = "AsIs";
        OnFailReturn[OnFailReturn["Empty"] = 1] = "Empty";
        OnFailReturn[OnFailReturn["Null"] = 2] = "Null";
    })(OnFailReturn = XVS.OnFailReturn || (XVS.OnFailReturn = {}));
    let RuntimeEnv;
    (function(RuntimeEnv) {
        RuntimeEnv[RuntimeEnv["Mac"] = 0] = "Mac";
        RuntimeEnv[RuntimeEnv["Windows"] = 1] = "Windows";
        RuntimeEnv[RuntimeEnv["Linux"] = 2] = "Linux";
        RuntimeEnv[RuntimeEnv["Web"] = 3] = "Web";
        RuntimeEnv[RuntimeEnv["Unsupported"] = 4] = "Unsupported";
    })(RuntimeEnv = XVS.RuntimeEnv || (XVS.RuntimeEnv = {}));
    let SupportedEnv;
    (function(SupportedEnv) {
        SupportedEnv[SupportedEnv["Mac"] = 0] = "Mac";
        SupportedEnv[SupportedEnv["Windows"] = 1] = "Windows";
        SupportedEnv[SupportedEnv["Linux"] = 2] = "Linux";
    })(SupportedEnv = XVS.SupportedEnv || (XVS.SupportedEnv = {}));
    let Directory;
    (function(Directory) {
        Directory[Directory["UserData"] = 0] = "UserData";
        Directory[Directory["Extensions"] = 1] = "Extensions";
    })(Directory = XVS.Directory || (XVS.Directory = {}));
    function getRuntimeEnv() {
        if (_vscode.env.uiKind === _vscode.UIKind.Web) {
            return 3;
        } else {
            switch(process.platform){
                case 'darwin':
                    return 0;
                case 'win32':
                    return 1;
                case 'linux':
                    return 2;
                default:
                    return 4;
            }
        }
    }
    XVS.getRuntimeEnv = getRuntimeEnv;
    function _getDefaultUserDataDir_(runtimeEnv, onFailCb) {
        switch(runtimeEnv){
            case 0:
                return XVS.DefaultDirs.UserData.Mac;
            case 1:
                return XVS.DefaultDirs.UserData.Windows;
            case 2:
                return XVS.DefaultDirs.UserData.Linux;
            default:
                return onFailCb(runtimeEnv, new Error('Unsupported platform'));
        }
    }
    // TEMPLATED FUNCTIONS
    XVS._getDefaultUserDataDir_ = _getDefaultUserDataDir_;
    function _getDefaultExtensionsDir_(runtimeEnv, onFailCb) {
        switch(runtimeEnv){
            case 0:
                return XVS.DefaultDirs.Extensions.Mac;
            case 1:
                return XVS.DefaultDirs.Extensions.Windows;
            case 2:
                return XVS.DefaultDirs.Extensions.Linux;
            default:
                return onFailCb(runtimeEnv, new Error('Unsupported platform'));
        }
    }
    XVS._getDefaultExtensionsDir_ = _getDefaultExtensionsDir_;
    async function _resolveRelativePath_(inputPath, onFailCb) {
        if (inputPath === null) {
            return onFailCb(inputPath, new Error('Input path is null'));
        }
        // Replace $HOME or ~ with the user's home directory
        let resolvedPath = inputPath.replace(/^~|\$HOME/, _os.homedir());
        // Replace environment variables like %APPDATA%
        resolvedPath = resolvedPath.replace(/%([^%]+)%/g, (_, key)=>process.env[key] ?? '');
        // Use path.resolve to get an absolute path (this also handles . and ..)
        try {
            resolvedPath = _path.resolve(resolvedPath);
            return resolvedPath;
        } catch (error) {
            return onFailCb(inputPath, error);
        }
    }
    function getDefaultUserDataDirOrNull() {
        return _getDefaultUserDataDir_(getRuntimeEnv(), (_original, error)=>{
            console.error('Failed to get the default user data directory:', error);
            return null;
        });
    }
    // CONCRETE FUNCTIONS
    /**
     * Get the default user data directory for the current platform
     * @param platform The platform to get the default user data directory for
     * @returns The default user data directory for the platform, or null on failure
     */ XVS.getDefaultUserDataDirOrNull = getDefaultUserDataDirOrNull;
    function getDefaultExtensionsDirOrNull() {
        return _getDefaultExtensionsDir_(getRuntimeEnv(), (_original, error)=>{
            console.error('Failed to get the default extensions directory:', error);
            return null;
        });
    }
    /**
     * Get the default extensions directory for the current platform
     * @param platform The platform to get the default extensions directory for
     * @returns The default extensions directory for the platform, or null on failure
     */ XVS.getDefaultExtensionsDirOrNull = getDefaultExtensionsDirOrNull;
    async function resolveRelativePathOrNull(path = null) {
        return _resolveRelativePath_(path, (_original, error)=>{
            console.error('Failed to resolve the relative path:', error);
            return null;
        });
    }
    XVS.resolveRelativePathOrNull = resolveRelativePathOrNull;
    async function getUserDataDirResolvedOrNull() {
        return resolveRelativePathOrNull(getDefaultUserDataDirOrNull());
    }
    XVS.getUserDataDirResolvedOrNull = getUserDataDirResolvedOrNull;
    async function getExtensionsDirResolvedOrNull() {
        return resolveRelativePathOrNull(getDefaultUserDataDirOrNull());
    }
    XVS.getExtensionsDirResolvedOrNull = getExtensionsDirResolvedOrNull;
    class FilePaths {
        _initial;
        constructor(path){
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
        get resolved() {
            return resolveRelativePathOrNull(this._initial);
        }
    }
    XVS.FilePaths = FilePaths;
    class UserData {
        static _dir = FilePaths.from(getDefaultUserDataDirOrNull());
        static keybindingsJson = FilePaths.from(UserData._dir.join('User/keybindings.json').initial);
        static tasksJson = FilePaths.from(UserData._dir.join('User/tasks.json').initial);
        static settingsJson = FilePaths.from(UserData._dir.join('User/settings.json').initial);
        static globalStateJson = FilePaths.from(UserData._dir.join('User/globalStorage/globalState.json').initial);
        static storageJson = FilePaths.from(UserData._dir.join('User/globalStorage/storage.json').initial);
        static profilesDir = FilePaths.from(UserData._dir.join('User/profiles').initial);
    }
    XVS.UserData = UserData;
    class Extensions {
        static _dir = FilePaths.from(getDefaultExtensionsDirOrNull());
    }
    XVS.Extensions = Extensions;
})(XVS || (XVS = {}));
 // namespace _encapsulated_
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

//# sourceMappingURL=vscodeEnvFacade.js.map