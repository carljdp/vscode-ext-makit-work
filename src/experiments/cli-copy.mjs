import * as fs from 'fs/promises';


// Define your package.json content
const packageJson = {
    name: 'your-project-name',
    version: '1.0.0',
    description: 'Your project description',
    main: 'index.js', // Change this if your entry point file is different
    scripts: {
        start: 'node index.js' // Adjust this based on your project setup
    },
    author: 'Your Name',
    license: 'MIT', // Adjust as needed
    dependencies: {
        // Add your project dependencies here
    },
    devDependencies: {
        // Add your project devDependencies here
    }
};

// Write the package.json file
fs.writeFile('package.json', JSON.stringify(packageJson, null, 2), err => {
    if (err) {
        console.error('Error writing package.json file:', err);
    } else {
        console.log('package.json file generated successfully.');
    }
});
