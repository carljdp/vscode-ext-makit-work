
import express from 'express';

import app from './server.js';



const _isDev_ = true;
const _isDebug_ = true;

import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the directory where your build artifacts are located
const staticDir = resolve(join(__dirname, 'dist'));

// Serve static files from the 'dist' directory
app.use(express.static(staticDir));

// Serve index.html for all routes to enable client-side routing
app.get('*', (req, res) => {
    res.sendFile(join(staticDir, 'index.html'));
});
