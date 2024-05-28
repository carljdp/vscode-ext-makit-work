
import { resolve, join } from 'node:path';
import fs from 'node:fs';
import express from 'express';

import lodash from 'lodash';
const { merge } = lodash;

import sharp from 'sharp';

import { pathToFileURL } from 'node:url';
// import { fileURLToPath } from 'node:url';
// import { dirname, resolve, join } from 'node:path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


interface ServerConfig {
    // minimum required
    SERVER_ROOT_RELATIVE: string;
    SERVER_PORT: number;
    FILES_AS_HTML: boolean;

    // derived from above
    SERVER_ROOT_ABSOLUTE?: string;
    SERVER_URL_BASE?: string;
}

const DEFAULT: ServerConfig = {
    SERVER_ROOT_RELATIVE: './',
    SERVER_ROOT_ABSOLUTE: undefined,
    SERVER_PORT: 3000,
    FILES_AS_HTML: false,
};
const CONFIG = DEFAULT;

const logTag = `cli-server`

const cliArgsRaw = process.argv
    .slice(2)
    .filter(arg => arg.startsWith('--cli-server-args='))
    .map(arg => arg.split('=')[1]);

const cliArgsParsed = cliArgsRaw
    .map(arg => {
        try { return JSON.parse(arg); } catch (e) {
            console.error(`[${logTag}] Invalid JSON: ${arg}`);
            return undefined;
        }
    })
    .filter(arg => arg !== undefined);

const cliArgsParsedFlat = cliArgsParsed
    .reduce((prev, curr) => merge(prev, curr), {});



if (cliArgsParsedFlat.path === undefined || cliArgsParsedFlat.path === null || cliArgsParsedFlat.path === '') {
    console.info(`[${logTag}] Args: 'path' not specified. Falling back to default: ${DEFAULT.SERVER_ROOT_RELATIVE}`);
    cliArgsParsedFlat.path = DEFAULT.SERVER_ROOT_RELATIVE;
}
CONFIG.SERVER_ROOT_RELATIVE = cliArgsParsedFlat.path;

if (cliArgsParsedFlat.port === undefined || cliArgsParsedFlat.port === null || cliArgsParsedFlat.port === '') {
    console.info(`[${logTag}] Args: 'port' not specified. Falling back to default: ${DEFAULT.SERVER_PORT}`);
    cliArgsParsedFlat.port = DEFAULT.SERVER_PORT;
}
CONFIG.SERVER_PORT = cliArgsParsedFlat.port;

if (cliArgsParsedFlat.filesAsHtml === undefined || cliArgsParsedFlat.filesAsHtml === null || cliArgsParsedFlat.filesAsHtml === '') {
    console.info(`[${logTag}] Args: 'filesAsHtml' not specified. Falling back to default: ${DEFAULT.FILES_AS_HTML}`);
    cliArgsParsedFlat.filesAsHtml = DEFAULT.FILES_AS_HTML;
}
CONFIG.FILES_AS_HTML = cliArgsParsedFlat.filesAsHtml === true || cliArgsParsedFlat.filesAsHtml === 'true';


try {
    CONFIG.SERVER_ROOT_ABSOLUTE = resolve(join(cliArgsParsedFlat.path));
} catch (error) {
    console.error(`[${logTag}] Failed to resolve static directory: ${cliArgsParsedFlat.path}`, error);
    console.info(`\n[${logTag}] Cannot start server. Exiting...`);
    process.exit(1);
}


CONFIG.SERVER_URL_BASE = `http://localhost:${cliArgsParsedFlat.port}`;


interface requestMetadata {
    decodedUrl: string;
    // method: string;
    // headers: { [key: string]: string };
}



const app = express();

// Start the server
app.listen(cliArgsParsedFlat.port, () => {
    console.log(`[${logTag}] root: ${pathToFileURL(CONFIG.SERVER_ROOT_ABSOLUTE!)}`);
    console.log(`[${logTag}] link: ${CONFIG.SERVER_URL_BASE}`);
});





const middleware = {

    attachRequestMetadata: (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!Object.hasOwnProperty.call(req, 'metadata')) {
            Object.defineProperty(req, 'metadata', {
                value: {},
                writable: true,
                enumerable: true,
                configurable: false
            });
        }
        next();
    },

    parseUrlIfEncoded: (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            req.url = recursiveDecodeURI(req.url);
        } catch (error) {
            console.warn(`[${logTag}] ${(error as Error).message}`);
            res.status(400).send(`Bad request: ${req.url}`);
            return;
        }
        // console.log(`[${logTag}] decoded URL: ${req.url}`);
        next();
    },

    errorHandler: (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.log(`[${logTag}] endOfChainMiddleware()`);
        if (err) {
            console.error(`[${logTag}] Express error: ${err.message}`, err);
            res.status(400).send(`Bad request: ${req.url}`);
        } else {
            res.status(404).send('Resource not found');
        }
        next(err);
    },
};

app.use(middleware.attachRequestMetadata);

app.use(middleware.parseUrlIfEncoded);

if (!CONFIG.FILES_AS_HTML) {
    console.log(`[${logTag}] Serving files statically (not as HTML).`);
    app.use(express.static(CONFIG.SERVER_ROOT_ABSOLUTE));
}
else {
    console.log(`[${logTag}] Serving files as HTML (not statically).`);
}

app.use(middleware.errorHandler);


// favicon
app.get('/favicon.ico', (req: express.Request, res: express.Response) => {
    // console.log(`[${logTag}] Route: get favicon.ico`);

    // const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    //     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
    // </svg>`;
    const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"></svg>`;

    sharp(Buffer.from(svgImage))
        .resize(8, 8) // Set the size of the favicon
        .toBuffer()
        .then(buffer => {
            res.setHeader('Content-Type', 'image/x-icon');
            res.send(buffer);
        })
        .catch(err => {
            res.status(500).send('Error generating favicon');
        });

});

// any GET request
app.get('*', (req: express.Request, res: express.Response) => {
    console.log(`[${logTag}] GET: ${req.url}`);

    const decodedUrl = req.url;

    if (decodedUrl.match(/(\.\.|\\\\|\/\/)/)) {
        console.warn(`[${logTag}] Suspicious route: ${decodedUrl}`);
        console.log(`[${logTag}]   returning 400 Bad request`);
        // return malformed request
        res.status(400).send(`Bad request: ${req.url}`);
        return;
    }

    // does the requested resource exist?
    const resourceAbsolutePath = resolve(join(CONFIG.SERVER_ROOT_ABSOLUTE!, decodedUrl));
    if (!fs.existsSync(resourceAbsolutePath)) {
        console.warn(`[${logTag}]   Resource not found: ${resourceAbsolutePath}`);
        console.log(`[${logTag}]   returning 404 Resource not found`);
        res.status(404).send('Resource not found');
        return;
    }
    // is the requested resource a directory?
    const isDirectory = fs.lstatSync(resourceAbsolutePath).isDirectory();

    if (isDirectory) {
        console.log(`[${logTag}]   Directory listing`);

        const dirAsHtml = dirListingAsHtmlStr(CONFIG, decodedUrl);
        if (dirAsHtml instanceof Error) {
            console.warn(`[${logTag}]     ${dirAsHtml.message}`);
            console.log(`[${logTag}]     returning 404 Resource not found`);
            res.status(404).send('Resource not found');
            return;
        }
        else {
            console.log(`[${logTag}]     served`);
            res.send(dirAsHtml);
            return;
        }

    }

    console.log(`[${logTag}]   File`);
    const fileAsHtml = fileAsHtmlStr(CONFIG, decodedUrl);
    if (fileAsHtml instanceof Error) {
        console.warn(`[${logTag}]     ${fileAsHtml.message}`);
        console.log(`[${logTag}]     returning 404 Resource not found`);
        res.status(404).send('Resource not found');
        return;
    }
    else {
        console.log(`[${logTag}]   served`);

        res.send(fileAsHtml);
    }

});

// any other request
app.all('*', (req: express.Request, res: express.Response) => {
    console.log(`[${logTag}] ANY: ${req.url}`);

    console.log(`[${logTag}]   returning 404 Resource not found`);
    res.status(404).send('Resource not found');
});


function escapeHtml(text: string) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function dirListingAsHtmlStr(config: ServerConfig, path: string): string | Error {

    if (!config.SERVER_ROOT_ABSOLUTE || !config.SERVER_URL_BASE) return new Error(`Server not configured.`);

    let dirAbsolutePath;
    try {
        dirAbsolutePath = resolve(join(config.SERVER_ROOT_ABSOLUTE!, path));
    } catch (error) {
        const errMsg = `Failed to resolve directory path: ${dirAbsolutePath}`
        // console.warn(`[${logTag}] ${errMsg}`, error);
        return new Error(`${errMsg}`);
    }

    let dirContents: { name: string, isDir: boolean, url: URL }[] = [
        { name: '..', isDir: true, url: new URL(join(path, '..'), config.SERVER_URL_BASE!) }
    ];
    try {
        dirContents = [
            ...dirContents,
            ...fs.readdirSync(dirAbsolutePath)
                .map(item => {
                    return {
                        name: item,
                        isDir: fs.lstatSync(join(dirAbsolutePath, item)).isDirectory(),
                        url: new URL(join(path, item), config.SERVER_URL_BASE!),
                    }
                })]
    } catch (error) {
        const errMsg = `Failed to read directory: ${dirAbsolutePath}`
        // console.warn(`[${logTag}] ${errMsg}`, error);
        return new Error(`${errMsg}`);
    }

    const sortedDirs = dirContents
        .filter(item => item.isDir)
        .sort((a, b) => a.name.localeCompare(b.name));

    const sortedFiles = dirContents
        .filter(item => !item.isDir)
        .sort((a, b) => a.name.localeCompare(b.name));

    const htmlListItems = [...sortedDirs, ...sortedFiles]
        .map(item => {
            return `<li><a href="${item.url}">${item.name}</a></li>`;
        }).join('\n')

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Directory listing</title>
</head>
<body>
    <h1>Directory listing</h1>
    <ul>
        ${htmlListItems}
    </ul>
</body>
</html>
`;

    return htmlTemplate;
}

function fileAsHtmlStr(config: ServerConfig, path: string): string | Error {

    let fileAbsolutePath;
    try {
        if (!config.SERVER_ROOT_ABSOLUTE) throw new Error(`Server root not configured.`);
        fileAbsolutePath = resolve(join(config.SERVER_ROOT_ABSOLUTE, path));
    } catch (error) {
        const errMsg = `Failed to resolve file path: ${path}`
        // console.warn(`[${logTag}] ${errMsg}`, error);
        return new Error(`${errMsg}`);
    }

    let fileContents;
    try {
        fileContents = fs.readFileSync(fileAbsolutePath, 'utf-8');
    } catch (error) {
        const errMsg = `Failed to read file: ${fileAbsolutePath}`
        // console.warn(`[${logTag}] ${errMsg}`, error);
        return new Error(`${errMsg}`);
    }

    const escapedContent = escapeHtml(fileContents);
    const highlightedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Text File</title>
</head>
<body>
    <pre><code class="language-javascript">${escapedContent}</code></pre>
</body>
</html>
`;

    return highlightedHtml;
}

function recursiveDecodeURI(url: string): string {
    try {
        const decodedUrl = decodeURI(url);
        if (decodedUrl === url) return url;
        return recursiveDecodeURI(decodedUrl);
    } catch (error) {
        throw new Error(`Failed to decode URL: ${url}`);
    }
}
