The intent of this project/package is just as a fresh start for a Node + TypeScript project. It is not intended to be a full-fledged project template, but rather a starting point for a new project.

`--import=./preloader.js` launch configuration option is used to register the @swc typescript loader with Node. 

I hade issues with the above while using Node 20.9.0, but those went a way when I upgraded to Node 22.1.0 - so I'm not sure which exact version is causing the issue. Update, also seems to work on Node 21.7.3.