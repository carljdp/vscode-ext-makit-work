import path from 'node:path';
import express from 'express';

import app from './server.js';

const _isDev_ = true;
const _isDebug_ = true;

import { fileURLToPath } from 'node:url';

// Define the directory where your build artifacts are located
const staticDir = path.resolve(fileURLToPath('./'), 'dist');

// Serve static files from the 'dist' directory
app.use(express.static(staticDir));

// Serve index.html for all routes to enable client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});
