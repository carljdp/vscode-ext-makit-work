// file src/common/Environment.ts

// TESTING:
process.env.DEBUG = 'true';

const _isDebug_ = ((env: NodeJS.ProcessEnv): boolean => {
    const value: string = JSON.stringify(env.DEBUG || '').replace(/['"]+/g, '').trim();
    return ['true', 'yes', 'on', '1'].includes(value.toLowerCase());
})(process.env);

export { _isDebug_ };