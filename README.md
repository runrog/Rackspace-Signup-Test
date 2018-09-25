# Rackspace Signup Test

### [Demo](http://rogeravalos.com/Rackspace-Sign…)

### Setup
Install dependencies
```
npm install
```

Run with browserSync (live reload)
```
npm start
```
This should auto launch your browser @ http://localhost:2004/

---

### Testing

This repo has a combination of Karma + Mocha + Chai for testing all form input validation methods. To run them use:
```
npm run test
```
---
### Linting

To lint all javascript in ```src/``` run:
```
npm run lint:js
```
To lint all scss in ```src/``` run:
```
npm run lint:sass
```
---
### Deploying
This script will run a series of tasks to create a static version of the app for deployment to github pages.
```
npm run deploy
```

---
### Templating
This project uses EJS for templating which gets rendered at runtime via node (```server.js```). Node gives EJS an ```env``` environment variable so that we can tell ejs where to serve files if in development. See ```src/index.ejs``` for examples.

---
### Automation
Gulp is setup to automate these tasks by default on ```npm start```. Below is a breakdown of the individual items in the event they need to be ran manually.

##### Fetching Zoolander
This task fetches the major components from Zoolander and adds them to this project's ```dist/``` folder.
```
gulp build-zoolander
```

##### Building SASS
This task takes all scss files under ```src/styles``` then compiles, minimizes and auto prefixes all of it into a css file into ```dist/```.
```
gulp build-sass
```

##### Building Javascript
This task takes all .js files under ```src/js``` then transpiles, minimizes and concats them all into an app.min.js file inside ```dist/```.
```
gulp build-js
```

##### Building Images
Images need to be served from the ```images/``` folder. This task takes those images, compresses them and places copies into ```dist/```.
```
gulp build-images
```

##### Distributing Node Modules
If you need to install a node module that needs to be distributed, for example - jQuery, the source(```./node_modules/...```) and destination (```./dist/...```) paths needs to be added to the task array in the gulpfile.js so that gulp can move the necessary files where needed with the following command.
```
gulp build-node-modules
```

##### Compiling EJS
This task takes all .ejs templates in ```src/```, compiles them all to .html files and creates the directory structure into ```dist/```.
```
gulp build-ejs
```

##### Build Distribution
This task runs all of the above in one go, hence the name. It builds the entire distribution folder for you.
```
gulp build-dist
```
