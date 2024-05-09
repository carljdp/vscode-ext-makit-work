import path = require('path');
import express = require('express');



const _isDev_ = true;
const _isDebug_ = true;

const app: express.Express = express();
const PORT = process.env.PORT || 3000;

// Define the directory where your build artifacts are located
const staticDir = path.resolve(__dirname, 'dist');

// Serve static files from the 'dist' directory
app.use(express.static(staticDir));

// Serve index.html for all routes to enable client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log(`    _isDev_: ${_isDev_}, _isDebug_: ${_isDebug_}`);
});
