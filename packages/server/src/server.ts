import express from 'express';


// CONSTANTS


const PORT = process.env.PORT || 3000;


// IMPLEMENTATION


const app = express();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`  or http://localhost:${PORT}/index.html`);
});


// EXPORTS


export default app;