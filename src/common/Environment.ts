// file src/common/Environment.ts

// TESTING:
process.env.DEBUG = 'true';

const _isDebug_ = ((env: NodeJS.ProcessEnv): boolean => {
    return (Boolean(env.DEBUG) && (['true', '1'].includes(env.DEBUG!.toLowerCase())));
})(process.env);

export { _isDebug_ };