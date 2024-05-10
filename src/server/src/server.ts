import express from 'express';

const _isDev_ = true;
const _isDebug_ = true;

const PORT = process.env.PORT || 3000;
const app = express();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log(`    _isDev_: ${_isDev_}, _isDebug_: ${_isDebug_}`);
});

export default app;